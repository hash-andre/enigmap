import raw from './catalog.json';
import portalData from './portals.json';
import type { Area, Category, MapDefinition, MapId, Point } from '../types';
export const points = raw as Point[];
export const areas: Record<Area, string> = { bleake: 'Bleake Island', miagani: 'Miagani Island', founders: 'Founders’ Island', subway: 'Metropolitana di Port Adams', stagg: 'Dirigibili Stagg', panessa: 'Panessa Studios', hq: 'Quartier generale Arkham Knight' };
export const categories: Record<Category, { label: string; plural: string; color: string; total: number }> = {
  trophy: { label: 'Trofeo', plural: 'Trofei', color: '#c1e889', total: 179 }, riddle: { label: 'Enigma', plural: 'Enigmi', color: '#a6c6ee', total: 40 }, breakable: { label: 'Distruttibile', plural: 'Distruttibili', color: '#dabd8c', total: 90 }, bomb: { label: 'Rivoltoso con bomba', plural: 'Rivoltosi con bomba', color: '#e7a7a1', total: 6 },
};
export const maps: MapDefinition[] = [
  { id: 'gotham', label: 'Gotham City', image: '/maps/gotham.svg', bounds: [[850, 1100], [3350, 3900]] },
  { id: 'panessa', label: 'Panessa Studios', image: '/maps/panessa.svg', bounds: [[0, 0], [1200, 970]], entry: [1068, 650], entryNote: 'Ascensore dalla terrazza degli studi.' },
  { id: 'subway', label: 'Port Adams · metropolitana', image: '/maps/subway.svg', bounds: [[170, 0], [1070, 960]], entry: [306, 917], entryNote: 'Ascensore del porto; accesso sbloccato durante la storia.' },
  { id: 'stagg-alpha', label: 'Stagg · dirigibile Alpha', image: '/maps/stagg-alpha.svg', bounds: [[0, 410], [1250, 750]], entry: [1022, 580], entryNote: 'Ingresso dalla botola sul tetto, poi scendi nel condotto.' },
  { id: 'stagg-beta', label: 'Stagg · dirigibile Beta', image: '/maps/stagg-beta.svg', bounds: [[0, 0], [1250, 310]], entry: [1160, 145], entryNote: 'Dopo la storia, rientra dall’apertura sul fronte del dirigibile.' },
  { id: 'hq-1', label: 'QG nord · livello 01', image: '/maps/hq-1.svg', bounds: [[0, 0], [200, 205]] },
  { id: 'hq-2', label: 'QG nord · livello 02', image: '/maps/hq-2.svg', bounds: [[0, 200], [200, 490]], entry: [96, 240] },
  { id: 'hq-3', label: 'QG nord · livello 03', image: '/maps/hq-3.svg', bounds: [[0, 520], [205, 800]] },
  { id: 'hq-4', label: 'QG nord · livello 04', image: '/maps/hq-4.svg', bounds: [[235, 0], [630, 315]] },
  { id: 'hq-5', label: 'QG nord · livello 05', image: '/maps/hq-5.svg', bounds: [[240, 310], [600, 760]] },
  { id: 'hq-south', label: 'QG · ingresso sud', image: '/maps/hq-south.svg', bounds: [[620, 260], [1170, 795]], entry: [828, 480], entryNote: 'Ingresso sul tetto del QG sud. Dopo la storia il passaggio dal QG nord è interrotto.' },
];
export const portals = portalData as { title: string; position: [number, number]; map: MapId; area: Area }[];
export const mapById = Object.fromEntries(maps.map(m => [m.id, m])) as Record<string, MapDefinition>;
