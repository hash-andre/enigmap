import { useEffect, useState } from 'react';
import { points } from '../data';
import { readProgress, serializeProgress, STORAGE_KEY } from '../progress';

export const knownPointIds = new Set(points.map(point => point.id));

function loadProgress() {
  try {
    return { ids: readProgress(localStorage, knownPointIds), error: '' };
  } catch {
    return {
      ids: new Set<string>(),
      error: 'Salvataggio locale non disponibile o danneggiato. Esporta i progressi prima di chiudere.',
    };
  }
}

export function useProgress() {
  const [loaded] = useState(loadProgress);
  const [completed, setCompleted] = useState(loaded.ids);
  const [storageError, setStorageError] = useState(loaded.error);

  useEffect(() => {
    // Do not overwrite a damaged save until the user changes their progress.
    if (completed === loaded.ids && loaded.error) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializeProgress(completed));
      setStorageError('');
    } catch {
      setStorageError('Salvataggio nel browser non riuscito. Esporta i progressi prima di chiudere.');
    }
  }, [completed, loaded]);

  function toggle(id: string) {
    setCompleted(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function merge(ids: ReadonlySet<string>) {
    setCompleted(previous => new Set([...previous, ...ids]));
  }

  return { completed, storageError, toggle, merge };
}
