# Project notes

Enigmap is a static, unofficial Batman: Arkham Knight collectible tracker: 315 items, English by default with Italian available, vector maps, local progress and manual transfer by code or JSON. Catwoman trials and DLC are excluded. The tutorial covers both transfer methods.

## Useful documents

- [Content audit](content-audit.md): inventory, sources, known inconsistencies and remaining map verification. Read before calling the guide fully verified.
- [Transfer code](transfer-code.md): permanent ID ordering, bit layout, checksum and compatibility rules. Required reading before changing the code format.
- [Import security review](import-security-review.md): boundaries and tests for JSON imports and transfer codes; not a complete security audit.
- [Deployment](deployment.md): build, hosting assumptions and checks before publishing.
- [Original project plan](enigmap-plan.md): historical intent and acceptance criteria. Some original choices were superseded; it is not the current implementation specification.

## Maintenance

Run `npm ci`, `npm test`, and `npm run build`. Browser checks require the dev server (`npm run dev`) and Chromium; the scripts default to `/usr/bin/brave`. Override with `ENIGMAP_BROWSER=/path/to/chromium`. Run `npm run test:browser`, `npm run test:language`, and `npm run test:transfer`. Browser checks use temporary profiles, not the user's saved progress.

Catalogs, map SVGs, source notes, generation scripts and tests belong in Git. Research downloads are kept in `/tmp/enigmap-research` by the scripts and are not needed for the app or build. Regenerating catalogs requires those references: use `python3 scripts/research.py`, then `python3 scripts/build-maps.py`, `python3 scripts/build-catalog.py`, and `python3 scripts/build-english.py`. The auxiliary `research-extra.py` script downloads comparison references, including legacy Catwoman material; it is not needed for the current app or build. Keep existing IDs and the frozen v1 transfer manifest unchanged.
