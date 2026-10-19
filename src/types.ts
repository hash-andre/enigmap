export type Category = 'trophy' | 'riddle' | 'breakable' | 'bomb';
export type Area = 'bleake' | 'miagani' | 'founders' | 'subway' | 'stagg' | 'panessa' | 'hq';
export type MapId = 'gotham' | 'subway' | 'stagg-alpha' | 'stagg-beta' | 'panessa' | 'hq-1' | 'hq-2' | 'hq-3' | 'hq-4' | 'hq-5' | 'hq-south';
export interface Point {
  id: string;
  number: number;
  category: Category;
  area: Area;
  map: MapId;
  title: string;
  position?: [number, number]; // [x, y], top-left origin; Gotham uses game's east/north grid (second, first).
  gameCoordinates?: [number, number];
  start?: [number, number]; // Same map coordinate system.
  location: string;
  requirements: string[];
  steps: string[];
  sources: { label: string; url: string }[];
  video?: string;
  locationNote?: string;
}
export interface MapDefinition {
  id: MapId;
  label: string;
  image: string;
  bounds: [[number, number], [number, number]];
  entry?: [number, number];
  entryNote?: string;
}
