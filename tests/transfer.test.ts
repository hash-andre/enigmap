import test from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { encodeTransferCode, decodeTransferCode, TRANSFER_V1_IDS } from '../src/transfer.ts';
import { points } from '../src/data/index.ts';

const first = TRANSFER_V1_IDS[0];
test('v1 manifest covers the catalog exactly and is immutable', () => {
  assert.equal(TRANSFER_V1_IDS.length, 315);
  assert.equal(new Set(TRANSFER_V1_IDS).size, 315);
  assert.deepEqual([...TRANSFER_V1_IDS].sort(), points.map(p => p.id).sort());
  assert.equal(Object.isFrozen(TRANSFER_V1_IDS), true);
  assert.equal(createHash('sha256').update(TRANSFER_V1_IDS.join('\n')).digest('hex'), 'ecb4873ce6f858093c04248673af47a015defb705f6e44cd32c1e028e44afc99');
});

test('transfer roundtrips empty, partial and full progress in both languages', () => {
  for (const language of ['en', 'it'] as const) {
    for (const ids of [[], [first, TRANSFER_V1_IDS[150], TRANSFER_V1_IDS[314]], [...TRANSFER_V1_IDS]]) {
      const code = encodeTransferCode(new Set(ids), language);
      assert.equal(code.length, 63);
      assert.match(code, /^EN1-[A-Za-z0-9_-]+$/);
      assert.deepEqual(decodeTransferCode(code), { ids: new Set(ids), language });
      assert.deepEqual(decodeTransferCode(` \n${code}\t `), { ids: new Set(ids), language });
      assert.equal(encodeTransferCode(new Set(ids.reverse()), language), code);
    }
  }
});

test('every collectible occupies its permanently assigned bit', () => {
  TRANSFER_V1_IDS.forEach((id, index) => {
    const code = encodeTransferCode(new Set([id]), 'en');
    const bytes = Buffer.from(code.slice(4), 'base64url');
    for (let byte = 0; byte < 40; byte++) assert.equal(bytes[byte], byte === (index >>> 3) ? 1 << (index & 7) : 0);
    assert.deepEqual(decodeTransferCode(code).ids, new Set([id]));
  });
  assert.equal(encodeTransferCode(new Set(['unknown', '__proto__']), 'en'), encodeTransferCode(new Set(), 'en'));
});

test('rejects corrupt, malformed, noncanonical, oversized and future codes', () => {
  const code = encodeTransferCode(new Set([first]), 'it');
  const bytes = Buffer.from(code.slice(4), 'base64url');
  bytes[0] ^= 1;
  const reserved = Buffer.from(code.slice(4), 'base64url'); reserved[39] |= 0x10;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const noncanonical = code.slice(0, -1) + alphabet[alphabet.indexOf(code.at(-1)!) | 1];
  for (const invalid of ['', code.slice(1), code+'=', code+'A', code.slice(0,20)+' '+code.slice(20), 'x'.repeat(257), code.replace('EN1-', 'EN2-'), 'EN1-'+bytes.toString('base64url'), 'EN1-'+reserved.toString('base64url'), 'EN1-AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGByV6HU', noncanonical]) {
    assert.throws(() => decodeTransferCode(invalid));
  }
});

// Independent golden vectors generated with Python zlib.crc32, not this implementation.
test('encoding matches independent CRC-32 golden vectors', () => {
  assert.equal(encodeTransferCode(new Set(), 'en'), 'EN1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKC94mQ');
  assert.equal(encodeTransferCode(new Set(), 'it'), 'EN1-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACK5malY');
});
