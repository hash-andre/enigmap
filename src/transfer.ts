import frozenIds from './data/transfer-v1.json';
import type { Language } from './translations';

// Wire format v1: never reorder or regenerate this manifest from a changing catalog.
export const TRANSFER_V1_IDS: readonly string[] = Object.freeze(frozenIds);
const PREFIX = 'EN1-';
const PAYLOAD_BYTES = 40;
const TOTAL_BYTES = 44;
const INVALID = 'Codice non valido o danneggiato.';

// CRC-32/ISO-HDLC, stored big-endian after the payload. Integrity check, not authentication.
function checksum(payload: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of [...new TextEncoder().encode(PREFIX), ...payload]) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeTransferCode(completed: ReadonlySet<string>, language: Language): string {
  const bytes = new Uint8Array(TOTAL_BYTES);
  TRANSFER_V1_IDS.forEach((id, index) => {
    if (completed.has(id)) bytes[index >>> 3] |= 1 << (index & 7);
  });
  if (language === 'it') bytes[39] |= 8;
  new DataView(bytes.buffer).setUint32(PAYLOAD_BYTES, checksum(bytes.subarray(0, PAYLOAD_BYTES)));
  return PREFIX + base64url(bytes);
}

export function decodeTransferCode(input: string): { ids: Set<string>; language: Language } {
  if (input.length > 256) throw new Error(INVALID);
  const code = input.trim();
  if (/^EN\d+-/.test(code) && !code.startsWith(PREFIX)) throw new Error('Versione del codice non supportata.');
  if (!/^EN1-[A-Za-z0-9_-]{59}$/.test(code)) throw new Error(INVALID);
  const encoded = code.slice(PREFIX.length);
  const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/') + '='), c => c.charCodeAt(0));
  if (bytes.length !== TOTAL_BYTES || base64url(bytes) !== encoded || (bytes[39] & 0xf0) !== 0 ||
      new DataView(bytes.buffer).getUint32(PAYLOAD_BYTES) !== checksum(bytes.subarray(0, PAYLOAD_BYTES))) {
    throw new Error(INVALID);
  }
  return {
    ids: new Set(TRANSFER_V1_IDS.filter((_, index) => bytes[index >>> 3] & (1 << (index & 7)))),
    language: bytes[39] & 8 ? 'it' : 'en',
  };
}
