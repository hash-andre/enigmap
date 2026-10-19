import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgress, readProgress, serializeProgress, STORAGE_KEY } from '../src/progress.ts';
const known = new Set(['bleake-trophy-01', 'miagani-trophy-01']);
test('export/import roundtrip preserves stable IDs and does not count duplicates', () => {
  const ids = new Set(['miagani-trophy-01', 'bleake-trophy-01']);
  assert.deepEqual(parseProgress(serializeProgress(ids), known).ids, ids);
  const imported = parseProgress(JSON.stringify({ app: 'enigmap', version: 1, completed: ['miagani-trophy-01', 'miagani-trophy-01', 'retired-point'] }), known);
  assert.equal(imported.ignored, 1); assert.deepEqual([...imported.ids], ['miagani-trophy-01']);
});
test('invalid files are rejected before updating progress', () => {
  for (const raw of ['{', 'null', '[]', '{"app":"enigmap","version":2,"completed":[]}', '{"app":"enigmap","version":1,"completed":[123]}', 'x'.repeat(1_000_001)]) assert.throws(() => parseProgress(raw, known));
});
test('missing storage starts empty; unavailable storage is surfaced to the caller', () => {
  assert.equal(readProgress({ getItem: () => null }, known).size, 0);
  assert.throws(() => readProgress({ getItem: () => { throw new Error('Denied'); } }, known));
  assert.deepEqual(readProgress({ getItem: key => key === STORAGE_KEY ? serializeProgress(new Set(['miagani-trophy-01'])) : null }, known), new Set(['miagani-trophy-01']));
});
