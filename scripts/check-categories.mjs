import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
const keys = ['trophy', 'riddle', 'breakable', 'bomb'];
const browser = await chromium.launch({ executablePath: process.env.ENIGMAP_BROWSER || '/usr/bin/brave', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const errors = [];
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 360, hasTouch: width === 360 });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    if (width === 360) await page.getByRole('button', { name: 'Open filters', exact: true }).click();
    const group = page.locator('.category-list');
    const checkboxes = keys.map((_, index) => group.getByRole('checkbox').nth(index));
    assert.equal(await group.getByRole('checkbox', { checked: true }).count(), 4);
    await page.getByLabel('Choose map or floor').selectOption('panessa');
    // Check every possible category combination, including none and multiple selections.
    for (let mask = 0; mask < 16; mask++) {
      for (let index = 0; index < keys.length; index++) await checkboxes[index].setChecked(!!(mask & (1 << index)));
      const expected = catalog.filter(point => point.map === 'panessa' && point.position && (mask & (1 << keys.indexOf(point.category)))).length;
      await page.locator('.filter-result').getByText(`${expected} points on this map`, { exact: true }).waitFor();
      for (let index = 0; index < keys.length; index++) {
        assert.equal(await checkboxes[index].isChecked(), !!(mask & (1 << index)));
        if (!(mask & (1 << index))) assert.equal(await page.locator(`.map-pin.${keys[index]}`).count(), 0);
      }
    }
    await checkboxes[2].uncheck(); await checkboxes[3].uncheck();
    if (width === 360) await page.getByRole('button', { name: 'Close filters', exact: true }).click();
    await page.getByRole('button', { name: 'Switch to Italian' }).click();
    if (width === 360) await page.getByRole('button', { name: 'Apri filtri', exact: true }).click();
    assert.equal(await page.getByRole('group', { name: 'CATEGORIE' }).getByRole('checkbox', { checked: true }).count(), 2);
    await page.getByRole('button', { name: 'Tutte', exact: true }).click();
    assert.equal(await group.getByRole('checkbox', { checked: true }).count(), 4);
    // Keyboard toggles one category without affecting the others.
    await checkboxes[0].focus(); await page.keyboard.press('Space');
    assert.equal(await checkboxes[0].isChecked(), false);
    assert.equal(await group.getByRole('checkbox', { checked: true }).count(), 3);
    for (const checkbox of checkboxes) await checkbox.uncheck();
    if (width === 360) await page.getByRole('button', { name: 'Chiudi filtri', exact: true }).click();
    await page.locator('.map-empty').getByRole('button', { name: 'Azzera filtri', exact: true }).click();
    if (width === 360) await page.getByRole('button', { name: 'Apri filtri', exact: true }).click();
    assert.equal(await group.getByRole('checkbox', { checked: true }).count(), 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await checkboxes[1].uncheck();
    await page.reload({ waitUntil: 'networkidle' });
    if (width === 360) await page.getByRole('button', { name: 'Apri filtri', exact: true }).click();
    assert.equal(await group.getByRole('checkbox', { checked: true }).count(), 4);
    await page.screenshot({ path: `/tmp/enigmap-categories-${width}.png` });
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: all categories checked on entry, all 16 combinations, marker filtering, reset, language, keyboard and desktop/mobile 360px.');
} finally { await browser.close(); }
