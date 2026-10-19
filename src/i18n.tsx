import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { points as originalPoints, maps as originalMaps, areas as originalAreas, categories as originalCategories } from './data';
import englishPoints from './data/catalog.en.json';
import { LANGUAGE_KEY, readLanguage, translate, type Language } from './translations';
import type { Area, MapDefinition, Point } from './types';

type Translate = (text: string, values?: Record<string, string | number>) => string;
interface Locale { language: Language; setLanguage: (language: Language) => void; t: Translate }
const LocaleContext = createContext<Locale | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try { return readLanguage(localStorage); } catch { return 'en'; }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Preference still works for the current visit. */ }
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (text: string, values?: Record<string, string | number>) => translate(text, language, values) }), [language]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('LanguageProvider is required');
  return context;
}
const englishCatalog = englishPoints as Record<string, { title: string; steps: string[] }>;
export function localizePoint(p: Point, language: Language): Point {
  if (language === 'it') return p;
  const translated = englishCatalog[p.id];
  if (!translated) throw new Error(`Missing English point: ${p.id}`);
  return { ...p, ...translated, location: translate(p.location, language), requirements: p.requirements.map(s => translate(s, language)),
    locationNote: p.locationNote ? translate(p.locationNote, language) : undefined,
    sources: p.sources.map(s => ({ ...s, label: translate(s.label, language) })),
  };
}
// Searching either language continues to find the same point after switching.
export const pointSearchIndex = new Map(originalPoints.map(p => {
  const en = localizePoint(p, 'en');
  return [p.id, [p.title, en.title, p.location, en.location, ...p.requirements, ...en.requirements].join(' ')];
}));
export function useTranslatedData() {
  const { language } = useLanguage();
  return useMemo(() => {
    const t = (s: string) => translate(s, language);
    const maps = originalMaps.map(m => ({ ...m, label: t(m.label), image: language === 'en' ? m.image.replace('.svg', '.en.svg') : m.image, entryNote: m.entryNote ? t(m.entryNote) : undefined }));
    return {
      points: originalPoints.map(p => localizePoint(p, language)),
      areas: Object.fromEntries(Object.entries(originalAreas).map(([key, value]) => [key, t(value)])) as Record<Area, string>,
      categories: Object.fromEntries(Object.entries(originalCategories).map(([key, value]) => [key, { ...value, label: t(value.label), plural: t(value.plural) }])) as typeof originalCategories,
      maps, mapById: Object.fromEntries(maps.map(m => [m.id, m])) as Record<string, MapDefinition>,
    };
  }, [language]);
}
