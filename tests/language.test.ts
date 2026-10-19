import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LANGUAGE_KEY, readLanguage, translate } from '../src/translations.ts';
import { points, maps } from '../src/data/index.ts';
import english from '../src/data/catalog.en.json';
import { localizePoint } from '../src/i18n.tsx';

test('English is the default; a saved Italian preference wins, and corrupt or unavailable storage is safe', () => {
  assert.equal(readLanguage({getItem: () => null}), 'en');
  assert.equal(readLanguage({getItem: key => key === LANGUAGE_KEY ? 'it' : null}), 'it');
  assert.equal(readLanguage({getItem: () => 'en'}), 'en');
  assert.equal(readLanguage({getItem: () => 'invalid'}), 'en');
  assert.equal(readLanguage({getItem: () => {throw new Error('Denied');}}), 'en');
});
test('every point has English content and localization preserves identity, map coordinates and sources', () => {
  assert.deepEqual(Object.keys(english).sort(), points.map(p => p.id).sort());
  for (const p of points) {
    const en = localizePoint(p, 'en');
    assert.ok(en.title && en.steps.length > 0 && en.steps.every(s => s.length > 5), p.id);
    assert.equal(en.steps.length, p.steps.length, `${p.id}: the translation must preserve the original numbered list`);
    for (const field of ['id','number','category','area','map','position','gameCoordinates','start'] as const) assert.deepEqual(en[field],p[field],`${p.id}: ${field}`);
    assert.deepEqual(en.sources.map(s => s.url),p.sources.map(s => s.url));
    assert.equal(localizePoint(p, 'it'), p);
  }
});
test('complex solutions retain their ordered numbered steps in English', () => {
  const point = (id: string) => localizePoint(points.find(p => p.id === id)!, 'en');
  const vents = point('panessa-trophy-17').steps;
  assert.equal(vents.length, 3);
  assert.match(vents[0], /Explosive Gel/);
  assert.match(vents[1], /first Batarang.*second/s);
  assert.match(vents[2], /third Batarang.*fuse box/s);
  const pipes = point('hq-trophy-14').steps;
  assert.equal(pipes.length, 4);
  assert.match(pipes[0], /Hack the door/);
  assert.match(pipes[1], /before starting/);
  assert.match(pipes[2], /first green.*first red/s);
  assert.match(pipes[3], /lower pipe.*second red.*second green.*third green.*third red/s);
});
test('room label variants exist and language-dependent metadata is translated', () => {
  for (const m of maps) assert.ok(existsSync('public'+m.image.replace('.svg','.en.svg')),m.id);
  assert.equal(translate('QG nord · livello 04','en'), 'North HQ · level 04');
  assert.equal(translate('{count} punti su questa mappa','en',{count:3}), '3 points on this map');
  assert.equal(translate('{count} punti su questa mappa','it',{count:3}), '3 punti su questa mappa');
  for (const p of points) {
    for (const s of [...p.requirements,p.location,p.locationNote ?? '']) {
      if (/Accesso|Scansion|Marker|Il marker|Nessuna|Quartier|Dirigibil|Livello|completat|Verricello|Granata|Bat-artiglio|quarantena/.test(s)) assert.notEqual(translate(s,'en'),s,s);
    }
  }
});
