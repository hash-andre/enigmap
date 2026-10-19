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

test('hostile IDs and metadata cannot enter progress or pollute object prototypes', () => {
  const raw = '{"app":"enigmap","version":1,"completed":["bleake-trophy-01","__proto__","constructor","<img src=x onerror=alert(1)>","javascript:alert(1)"],"__proto__":{"enigmapPolluted":true},"constructor":{"prototype":{"enigmapPolluted":true}},"title":"<script>alert(1)</script>"}';
  const result = parseProgress(raw, known);
  assert.deepEqual([...result.ids], ['bleake-trophy-01']);
  assert.equal(result.ignored, 4);
  assert.equal(Object.hasOwn(Object.prototype, 'enigmapPolluted'), false);
  assert.equal(serializeProgress(result.ids).includes('<'), false);
});

test('rejects nested IDs, oversized ID arrays and overly long strings', () => {
  for (const completed of [[{ id: 'bleake-trophy-01' }], [['bleake-trophy-01']], [null], ['x'.repeat(129)], Array(10_001).fill('bleake-trophy-01')]) {
    assert.throws(() => parseProgress(JSON.stringify({ app: 'enigmap', version: 1, completed }), known));
  }
});

test('file reader rejects large files before reading and hides arbitrary read errors', async () => {
  const { readProgressFile, MAX_PROGRESS_BYTES } = await import('../src/progress.ts');
  let read = false;
  await assert.rejects(readProgressFile({ size: MAX_PROGRESS_BYTES + 1, text: async () => { read = true; return ''; } }, known), /troppo grande/);
  assert.equal(read, false);
  await assert.rejects(readProgressFile({ size: 1, text: async () => { throw new Error('<img onerror=alert(1)>'); } }, known), /Impossibile leggere il file/);
  const raw = serializeProgress(new Set(['bleake-trophy-01']));
  assert.deepEqual((await readProgressFile({ size: raw.length, text: async () => raw }, known)).ids, new Set(['bleake-trophy-01']));
});
