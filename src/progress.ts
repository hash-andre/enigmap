export const STORAGE_KEY = 'enigmap.progress.v1';
export const MAX_PROGRESS_BYTES = 1_000_000;
const MAX_COMPLETED_IDS = 10_000;
const MAX_ID_LENGTH = 128;
const INVALID_FORMAT = 'Scegli un file progressi Enigmap, versione 1.';

export interface ProgressFile {
  app: 'enigmap';
  version: 1;
  completed: string[];
  exportedAt?: string;
}

export interface ParsedProgress {
  ids: Set<string>;
  ignored: number;
}

export function readProgress(storage: Pick<Storage, 'getItem'>, known: ReadonlySet<string>) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw ? parseProgress(raw, known).ids : new Set<string>();
}

export async function readProgressFile(file: Pick<File, 'size' | 'text'>, known: ReadonlySet<string>) {
  // Check bytes before loading the file into memory; MIME and extensions are not validation.
  if (file.size > MAX_PROGRESS_BYTES) throw new Error('Il file è troppo grande.');
  let raw: string;
  try { raw = await file.text(); }
  catch { throw new Error('Impossibile leggere il file. I progressi non sono stati modificati.'); }
  return parseProgress(raw, known);
}

export function parseProgress(raw: string, known: ReadonlySet<string>): ParsedProgress {
  if (raw.length > MAX_PROGRESS_BYTES) throw new Error('Il file è troppo grande.');
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error('Il file non contiene JSON valido.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Formato del file non valido.');
  }
  const data = value as Record<string, unknown>;
  if (!['app', 'version', 'completed'].every(key => Object.hasOwn(data, key)) ||
      data.app !== 'enigmap' || data.version !== 1 || !Array.isArray(data.completed) ||
      data.completed.length > MAX_COMPLETED_IDS ||
      !data.completed.every(id => typeof id === 'string' && id.length <= MAX_ID_LENGTH)) {
    throw new Error(INVALID_FORMAT);
  }

  // Project only known primitive IDs. Never merge imported objects into application data,
  // render their values as HTML, or use imported strings as URLs / object property paths.
  const ids = new Set<string>();
  const unknown = new Set<string>();
  for (const id of data.completed as string[]) {
    if (known.has(id)) ids.add(id);
    else unknown.add(id);
  }
  return { ids, ignored: unknown.size };
}

export function serializeProgress(ids: ReadonlySet<string>): string {
  return JSON.stringify({
    app: 'enigmap', version: 1, completed: [...ids].sort(), exportedAt: new Date().toISOString(),
  } satisfies ProgressFile, null, 2);
}
