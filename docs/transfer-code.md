# Transfer code v1

Offline snapshot of the 315 collectible flags and the selected language. Codes merge completions and apply their language; they do not synchronize devices. Existing JSON files and localStorage keys are unchanged.

## Wire format

`EN1-` followed by 59 canonical, unpadded Base64url characters: 63 characters in total. The decoded buffer is exactly 44 bytes.

- Bytes 0–39: bitset, least significant bit first in each byte.
- Bits 0–314: IDs at the matching indices in `src/data/transfer-v1.json`. This manifest is frozen and must never be reordered or regenerated. A new mapping requires a new format version and retention of the old decoder.
- Bit 315: English = 0, Italian = 1.
- Bits 316–319: reserved, must be zero.
- Bytes 40–43: CRC-32/ISO-HDLC, big-endian, over the ASCII prefix `EN1-` followed by bytes 0–39. Polynomial 0x04C11DB7 (reflected 0xEDB88320), initial value and final XOR 0xFFFFFFFF.

The checksum detects accidental corruption; it is not encryption or authentication. Anyone can construct a valid code for any progress state.

Input is bounded to 256 characters before trimming outer whitespace. Internal whitespace, unknown versions, noncanonical Base64url, invalid length, reserved bits and checksum mismatches are rejected before changing progress or language. Decoding yields only IDs from the frozen manifest and one of the two supported language values.

## Verification

`npm test` covers every bit, both languages, independent CRC fixtures, frozen manifest identity, invalid input and reserved bits even with a correct CRC. `npm run test:transfer` checks two isolated browser sessions, desktop and mobile, clipboard fallback, repeated imports, persistence, focus handling and blocked storage with JSON export still available. It uses a temporary Brave profile and never changes the user's browser save.
