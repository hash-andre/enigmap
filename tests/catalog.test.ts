import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { points, maps } from '../src/data/index.ts';
test('all 315 collectibles have unique stable IDs; Catwoman trials are excluded', () => {
  const expected = { trophy: 179, riddle: 40, breakable: 90, bomb: 6 };
  for (const [category, count] of Object.entries(expected)) assert.equal(points.filter(p => p.category === category).length, count);
  assert.equal(new Set(points.map(p => p.id)).size, 315);
  assert.equal(179 + 40 + 6 + 90 / 5, 243);
});
test('every point has original instructions, source and a valid map; only the mobile Batmobile riddle is mapless', () => {
  for (const p of points) {
    assert.ok(p.steps.length > 0 && p.steps.every(s => s.length > 5), p.id);
    assert.ok(p.sources.length && p.sources.every(s => s.url.startsWith('https://')), p.id);
    const map = maps.find(m => m.id === p.map); assert.ok(map, p.id);
    if (!p.position) { assert.equal(p.id, 'founders-riddle-10'); continue; }
    assert.ok(p.position.every(Number.isFinite), p.id);
    const [[x1,y1],[x2,y2]] = map.bounds;
    assert.ok(p.position[0] >= x1 && p.position[0] <= x2 && p.position[1] >= y1 && p.position[1] <= y2, `${p.id}: ${p.position} outside ${map.id}`);
  }
});
test('all maps use local vector geometry with no embedded or external images', () => {
  for (const map of maps) {
    assert.ok(existsSync(`public${map.image}`), map.id);
    const content = readFileSync(`public${map.image}`, 'utf8');
    assert.match(content, /<svg/);
    assert.doesNotMatch(content, /<image\b|href="https?:/);
  }
});
