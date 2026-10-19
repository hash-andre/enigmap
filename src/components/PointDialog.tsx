import { ArrowUpRight, Check, ChevronDown, ChevronRight, Layers, Map as MapIcon } from 'lucide-react';
import { useLanguage, useTranslatedData } from '../i18n';
import type { MapId, Point } from '../types';
import Dialog from './Dialog';
import MapView from './MapView';
import { CategoryIcon } from './Icons';

interface PointDialogProps {
  point: Point;
  completed: boolean;
  completedIds: Set<string>;
  onToggle: () => void;
  onClose: () => void;
  onOpenMap: (id: MapId) => void;
}

export default function PointDialog({ point, completed, completedIds, onToggle, onClose, onOpenMap }: PointDialogProps) {
  const { t, language } = useLanguage();
  const { categories, mapById } = useTranslatedData();
  const map = mapById[point.map];

  return <Dialog title={point.title} className="point-dialog" onClose={onClose}>
    <div className="point-header">
      <div className={`point-category ${point.category}`}>
        <CategoryIcon category={point.category} />
        <span>{categories[point.category].label} {point.number.toString().padStart(2, '0')}</span>
        {completed && <span className="done-badge"><Check size={12} />{t('Completato')}</span>}
      </div>
      <h1>{point.title}</h1>
      <p>{point.location}</p>
    </div>
    <div className="point-scroll">
      <div className="point-map-section">
        {point.position ? <>
          <MapView mapId={point.map} points={[point]} completed={completedIds} mini selected={point} />
          <div className="mini-map-caption">
            <span><span className="legend-dot" />{t(point.category === 'bomb' ? 'Pedana' : 'Punto d’interesse')}</span>
            {point.start && <span><span className="start-key">{language === 'en' ? 'S' : 'P'}</span>{t('Partenza · collegamento indicativo')}</span>}
            <button onClick={() => onOpenMap(point.map)}>{t('Apri area')} <ArrowUpRight size={13} /></button>
          </div>
        </> : <div className="no-fixed-map"><MapIcon size={26} /><span>{t('Disponibile ovunque')}</span></div>}
        {point.gameCoordinates && <div className="game-coordinates">
          <span>{t('COORDINATE NEL GIOCO')}</span><code>{point.gameCoordinates.join(', ')}</code>
        </div>}
        {point.locationNote && <p className="location-note">{point.locationNote}</p>}
      </div>
      <div className="solution-section">
        {point.requirements.length > 0 && <>
          <h2>{t('Ti serve')}</h2>
          <div className="requirements">{point.requirements.map(requirement => <span key={requirement}>{requirement}</span>)}</div>
        </>}
        <h2>{t('Come risolvere')}</h2>
        <ol className="solution-steps">{point.steps.map((step, index) => <li key={index}>
          <span>{(index + 1).toString().padStart(2, '0')}</span><p>{step}</p>
        </li>)}</ol>
        {map.entryNote && <p className="entry-note"><Layers size={15} />{map.entryNote}</p>}
        <details className="sources">
          <summary>{t('Fonti della soluzione')} <ChevronDown size={14} /></summary>
          {point.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            {source.label}<ArrowUpRight size={13} />
          </a>)}
          {point.video && <a href={point.video} target="_blank" rel="noreferrer">{t('Guarda la soluzione video')} <ArrowUpRight size={13} /></a>}
        </details>
      </div>
    </div>
    <div className="point-completion">
      <label className={completed ? 'is-completed' : ''}>
        <input type="checkbox" checked={completed} onChange={onToggle} />
        <span className="completion-checkbox">{completed && <Check size={17} />}</span>
        <span><strong>{t('Completato')}</strong><small>{t(completed ? 'Salvato nei tuoi progressi' : 'Segna questa sfida come risolta')}</small></span>
      </label>
      <button onClick={onClose}>{t('Torna alla mappa')} <ChevronRight size={15} /></button>
    </div>
  </Dialog>;
}
