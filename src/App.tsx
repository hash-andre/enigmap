import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowUpRight, Check, ChevronDown, Ellipsis, Car, HelpCircle, Layers, Map as MapIcon, Search, SlidersHorizontal, Languages, Copy, X } from 'lucide-react';
import { categories as originalCategories } from './data';
import { useLanguage, useTranslatedData, pointSearchIndex } from './i18n';
import type { Area, Category, MapId, Point } from './types';
import { readProgressFile, serializeProgress } from './progress';
import { useProgress, knownPointIds } from './hooks/useProgress';
import MapView from './components/MapView';
import Dialog from './components/Dialog';
import PointDialog from './components/PointDialog';
import TransferDialog from './components/TransferDialog';
import { translate } from './translations';
import { CategoryIcon } from './components/Icons';

const categoryKeys = Object.keys(originalCategories) as Category[];
const mapForArea: Partial<Record<Area, MapId>> = { panessa: 'panessa', subway: 'subway', stagg: 'stagg-alpha', hq: 'hq-2' };

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { points, areas, categories, maps } = useTranslatedData();
  const { completed, storageError, toggle, merge } = useProgress();
  const [notice, setNotice] = useState('');
  const [area, setArea] = useState<Area | 'all'>('all');
  const [mapId, setMapId] = useState<MapId>('gotham');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = points.find(p => p.id === selectedId) ?? null;
  function setSelected(point: Point | null) { setSelectedId(point?.id ?? null); }
  const [tutorial, setTutorial] = useState(false);
  const [progressMenu, setProgressMenu] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 7000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!progressMenu) return;
    const close = (event: MouseEvent) => { if (!(event.target as Element).closest('.progress-actions')) setProgressMenu(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setProgressMenu(false); };
    document.addEventListener('click', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', escape); };
  }, [progressMenu]);

  const visible = useMemo(() => points.filter(p => (area === 'all' || p.area === area) && (category === 'all' || p.category === category) && (!pendingOnly || !completed.has(p.id)) && (!query || `${pointSearchIndex.get(p.id)} ${p.number} ${p.gameCoordinates?.join(' ')} ${p.id}`.toLocaleLowerCase(language).includes(query.toLocaleLowerCase(language).trim()))), [area, category, pendingOnly, completed, query, language, points]);
  const onMap = useMemo(() => visible.filter(p => p.map === mapId && p.position), [visible, mapId]);
  const offMap = visible.filter(p => p.map !== mapId || !p.position);
  const physicalDone = points.filter(p => completed.has(p.id)).length;
  const percent = Math.round(physicalDone / points.length * 100);

  function chooseMap(id: MapId) { setMapId(id); const point = points.find(p => p.map === id); if (id !== 'gotham' && point) setArea(point.area); else setArea('all'); }
  function chooseArea(value: Area | 'all') { setArea(value); setMapId(value === 'all' ? 'gotham' : mapForArea[value] ?? 'gotham'); }
  function exportFile() {
    const url = URL.createObjectURL(new Blob([serializeProgress(completed)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `enigmap-${language === 'en' ? 'progress' : 'progressi'}-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setProgressMenu(false);
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const { ids, ignored } = await readProgressFile(file, knownPointIds);
      const added = [...ids].filter(id => !completed.has(id)).length;
      merge(ids);
      setNotice(t('{count} nuovi completamenti importati.', { count: added }) + (ignored ? t(' {count} ID sconosciuti ignorati.', { count: ignored }) : ''));
    } catch (error) { setNotice(t(error instanceof Error ? error.message : 'Impossibile leggere il file. I progressi non sono stati modificati.')); }
    if (fileInput.current) fileInput.current.value = '';
    setProgressMenu(false);
  }

  return <div className="app">
    <header className="header">
      <a className="brand" href="/" aria-label={t('Enigmap, pagina iniziale')}><span className="brand-mark">?</span><span><span className="wordmark">Enigmap</span></span></a>
      <div className="header-right"><span className="game-identity"><img className="batman-logo" src="/batman-logo.svg" alt="" /><span className="game-name">BATMAN<span>ARKHAM KNIGHT</span></span></span><span className="header-divider" /><button className="tutorial-button" onClick={() => setTutorial(true)}><HelpCircle size={17} /><span>{t('Come funziona')}</span></button><button className="language-button" aria-label={t(language === 'en' ? 'Passa all’italiano' : 'Passa all’inglese')} title={t('Cambia lingua')} onClick={() => setLanguage(language === 'en' ? 'it' : 'en')}><Languages size={16} /><span>{language.toUpperCase()}</span></button></div>
    </header>
    <div className="workspace">
      <aside className={`sidebar ${filtersOpen ? 'sidebar-open' : ''}`} aria-label={t('Filtri e progressi')}>
        <div className="sidebar-mobile-heading"><span>{t('Esplora Gotham')}</span><button className="icon-button" aria-label={t('Chiudi filtri')} onClick={() => setFiltersOpen(false)}><X size={20} /></button></div>
        <div className="progress-panel">
          <div className="eyebrow">{t('LA TUA INDAGINE')}<div className="progress-actions"><button className="icon-button" aria-label={t('Gestisci progressi')} aria-expanded={progressMenu} onClick={() => setProgressMenu(!progressMenu)}><Ellipsis size={20} /></button>{progressMenu && <div className="progress-menu"><button onClick={() => { setProgressMenu(false); setFiltersOpen(false); setTransferOpen(true); }}><Copy size={16} />{t('Trasferisci con codice')}</button><button onClick={exportFile}><ArrowDownToLine size={16} />{t('Esporta progressi')}</button><button onClick={() => fileInput.current?.click()}><ArrowUpFromLine size={16} />{t('Importa progressi')}</button><p>{t('Salvati in questo browser.')}<br />{t('Trasferiscili con un codice o un file.')}</p></div>}</div></div>
          <div className="progress-number"><strong>{physicalDone}<span>/ {points.length}</span></strong><span className="percentage">{percent}%</span></div><div className="progress-track"><div style={{ width: `${percent}%` }} /></div><div className="progress-caption"><span>{t('Elementi completati')}</span><span className="local-indicator"><span />{t('Locale')}</span></div>
        </div>
        <div className="sidebar-filters">
          <label className="search"><Search size={17} /><input type="search" aria-label={t('Cerca un punto')} placeholder={t('Cerca un punto, un luogo…')} value={query} onChange={e => setQuery(e.target.value)} /><span>⌕</span></label>
          <label className="field-label" htmlFor="area-selector">{t('AREA')}</label><div className="select-wrap"><MapIcon size={16} /><select id="area-selector" value={area} onChange={e => chooseArea(e.target.value as Area | 'all')}><option value="all">{t('Tutte le aree')}</option>{Object.entries(areas).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><ChevronDown size={15} /></div>
          <div className="filter-title"><span>{t('CATEGORIE')}</span><button onClick={() => setCategory('all')} className={category === 'all' ? 'selected-text' : ''}>{t('Tutte')}</button></div>
          <div className="category-list">{categoryKeys.map(key => {
            const total = points.filter(p => p.category === key && (area === 'all' || p.area === area)); const done = total.filter(p => completed.has(p.id)).length;
            return <button key={key} className={`category-row ${category === key ? 'active' : ''}`} aria-pressed={category === key} onClick={() => setCategory(category === key ? 'all' : key)} style={{ '--category-color': categories[key].color } as CSSProperties}><span className="category-icon"><CategoryIcon category={key} /></span><span>{categories[key].plural}</span><span className="category-count">{done}<span> / {total.length}</span></span><span className="category-check">{category === key && <Check size={11} />}</span></button>;
          })}</div>
          <label className="pending-filter"><span>{t('Da completare')}</span><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} /><span className="switch" aria-hidden="true" /></label>
          <div className="filter-result"><span className="live-dot" />{t('{count} punti su questa mappa', { count: onMap.length })}<button title={t('Azzera filtri')} onClick={() => { setCategory('all'); setPendingOnly(false); setQuery(''); chooseArea('all'); }} aria-label={t('Azzera filtri')}><SlidersHorizontal size={14} /></button></div>
        </div>
      </aside>
      <main className="main">
        <div className="map-toolbar"><div className="map-selection"><Layers size={17} /><select id="map-selector" aria-label={t('Seleziona mappa o piano')} value={mapId} onChange={e => chooseMap(e.target.value as MapId)}>{maps.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select><ChevronDown size={15} /></div><div className="toolbar-right"><button className="mobile-filter-button" onClick={() => setFiltersOpen(true)} aria-label={t('Apri filtri')}><SlidersHorizontal size={16} /><span>{t('Filtri')}</span></button></div></div>
        {storageError && <div className="storage-warning" role="alert">{t(storageError)}<button onClick={exportFile}>{t('Esporta')}</button></div>}
        <div className="map-stage"><MapView mapId={mapId} points={onMap} completed={completed} onSelect={setSelected} onMapChange={chooseMap} area={area} />
          {!onMap.length && <div className="map-empty"><Search size={22} /><strong>{t('Nessun punto su questa mappa')}</strong><button onClick={() => { const next = offMap.find(p => p.position); if (next) chooseMap(next.map); else { setCategory('all'); setQuery(''); setPendingOnly(false); } }}>{t(offMap.some(p => p.position) ? 'Vai alla mappa con i risultati' : 'Azzera filtri')}</button></div>}
          {query && offMap.some(p => p.position) && <button className="other-results" onClick={() => chooseMap(offMap.find(p => p.position)!.map)}>{t('Vai ai risultati in un’altra mappa')} <ArrowUpRight size={15} /></button>}
          {visible.some(p => !p.position) && <button className="roaming-riddle" onClick={() => setSelected(points.find(p => p.id === 'founders-riddle-10')!)}><Car size={15} />{t('Enigma della Batmobile')} <ArrowUpRight size={13} /></button>}
        </div>
        <footer className="map-footer"><div><span className="legend-dot" /><span>{t('Da completare')}</span><span className="legend-done"><Check size={10} /></span><span>{t('Completato')}</span><span className="legend-portal">↳</span><span>{t('Interno')}</span></div><button onClick={() => setSourcesOpen(true)}>{t('Fonti e mappa')} <ArrowUpRight size={12} /></button></footer>
      </main>
    </div>
    {filtersOpen && <div className="mobile-scrim" onClick={() => setFiltersOpen(false)} />}
    <input hidden ref={fileInput} type="file" accept=".json,application/json" onChange={e => void importFile(e.target.files?.[0])} aria-label={t('Importa file progressi')} />
    {notice && <div className="toast" role="status">{notice}<button aria-label={t('Chiudi messaggio')} onClick={() => setNotice('')}><X size={16} /></button></div>}
    {selected && <PointDialog point={selected} completed={completed.has(selected.id)} completedIds={completed} onToggle={() => toggle(selected.id)} onClose={() => setSelected(null)} onOpenMap={id => { chooseMap(id); setSelected(null); }} />}
    {transferOpen && <TransferDialog completed={completed} onClose={() => setTransferOpen(false)} onImport={(ids, importedLanguage) => {
      const added = [...ids].filter(id => !completed.has(id)).length;
      merge(ids);
      setLanguage(importedLanguage);
      setTransferOpen(false);
      setNotice(translate('{count} nuovi completamenti importati.', importedLanguage, { count: added }));
    }} />}
    {tutorial && <Dialog title={t('Come funziona Enigmap')} className="tutorial-dialog" onClose={() => setTutorial(false)}><span className="tutorial-mark">?</span><div className="eyebrow">{t('TRE PASSI, ZERO MISTERI')}</div><h1>{t('La città è piena di domande.')}<br /><span>{t('Qui trovi le risposte.')}</span></h1><div className="tutorial-steps">{[{ Icon: MapIcon, title: 'Scegli un punto', text: 'Esplora la mappa o filtra per area e categoria.' }, { Icon: Search, title: 'Segui la soluzione', text: 'Apri la scheda: posizione, gadget e passaggi.' }, { Icon: Check, title: 'Spunta Completato', text: 'Il punto diventa grigio. I progressi restano nel browser.' }].map(({ Icon, title, text }, i) => <div key={i}><span><Icon size={21} /></span><div><h2>{t(title)}</h2><p>{t(text)}</p></div><small>0{i + 1}</small></div>)}</div><section className="tutorial-transfer"><h2>{t('La tua indagine · ⋯')}</h2><p>{t('Apri il menu ⋯ accanto ai progressi. Su telefono lo trovi nei Filtri.')}</p><h3>{t('Trasferisci con codice')}</h3><p>{t('Copia il codice e importalo sull’altro dispositivo: unisce le spunte e applica la lingua.')}</p><h3>{t('Esporta / Importa progressi')}</h3><p>{t('Esporta un file JSON come backup, poi importalo per aggiungere le spunte salvate. La lingua resta invariata.')}</p><p>{t('Il trasferimento è manuale: i dispositivi non si sincronizzano automaticamente.')}</p></section><button className="primary-button" onClick={() => setTutorial(false)}>{t('Inizia l’indagine')} <ArrowUpRight size={17} /></button></Dialog>}
    {sourcesOpen && <Dialog title={t('Fonti e cartografia')} className="sources-dialog" onClose={() => setSourcesOpen(false)}><div className="eyebrow">{t('DIETRO LA MAPPA')}</div><h1>{t('Fonti e cartografia')}</h1><p>{t('315 elementi fisici, equivalenti a 243 sfide: 179 trofei, 40 enigmi, 6 rivoltosi e 90 distruttibili (18 sfide).')}</p><p>{t('Gotham e gli interni usano cartografia vettoriale ricostruita dai riferimenti del gioco. Le posizioni interne indicano stanza e piano; gli accessi ai complessi sono indicativi. Le note nelle schede segnalano coordinate discordanti.')}</p><p>{t('Le schede sono controllate sulle guide, senza verifica diretta in gioco. Gotham e i suoi personaggi appartengono ai rispettivi titolari; Enigmap è un progetto non ufficiale.')}</p><div className="source-links">{[['PowerPyx · inventario', 'https://www.powerpyx.com/guides/batman-arkham-knight-trophy-guide.html'], ['Gamer Guides · coordinate e procedure', 'https://www.gamerguides.com/batman-arkham-knight/guide/collectibles-guide/collectible-locations/'], ['GamesRadar · soluzioni e riferimenti', 'https://www.gamesradar.com/batman-arkham-knight-riddler-guide/'], ['GameFAQs · guida di confronto', 'https://gamefaqs.gamespot.com/ps4/768083-batman-arkham-knight/faqs/72018']].map(([name,url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{t(name)}<ArrowUpRight size={15} /></a>)}</div><p className="privacy-note">{t('I progressi sono salvati solo in questo browser. Dal menu ⋯ puoi esportarli e importarli su un altro dispositivo. La cancellazione dei dati del browser rimuove il salvataggio locale.')}</p></Dialog>}
  </div>;
}
