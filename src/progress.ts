export const STORAGE_KEY = 'enigmap.progress.v1';
export interface ProgressFile { app: 'enigmap'; version: 1; completed: string[]; exportedAt?: string }
export function readProgress(storage: Pick<Storage, 'getItem'>, known: Set<string>) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw ? parseProgress(raw, known).ids : new Set<string>();
}
export function parseProgress(raw: string, known: Set<string>): { ids: Set<string>; ignored: number } {
  if (raw.length > 1_000_000) throw new Error('Il file è troppo grande.');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('Il file non contiene JSON valido.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Formato del file non valido.');
  const data = value as Partial<ProgressFile>;
  if (data.app !== 'enigmap' || data.version !== 1 || !Array.isArray(data.completed) || data.completed.length > 10000 || !data.completed.every(id => typeof id === 'string')) throw new Error('Scegli un file progressi Enigmap, versione 1.');
  const unique = new Set(data.completed);
  return { ids: new Set([...unique].filter(id => known.has(id))), ignored: [...unique].filter(id => !known.has(id)).length };
}
export function serializeProgress(ids: Set<string>): string {
  return JSON.stringify({ app: 'enigmap', version: 1, completed: [...ids].sort(), exportedAt: new Date().toISOString() } satisfies ProgressFile, null, 2);
}
