import { ArrowUpRight, Check, Map as MapIcon, Search } from 'lucide-react';
import { useLanguage } from '../i18n';
import Dialog from './Dialog';

const steps = [
  { Icon: MapIcon, title: 'Scegli un punto', text: 'Esplora la mappa o filtra per area e categoria.' },
  { Icon: Search, title: 'Segui la soluzione', text: 'Apri la scheda: posizione, gadget e passaggi.' },
  { Icon: Check, title: 'Spunta Completato', text: 'Il punto diventa grigio. I progressi restano nel browser.' },
];

export default function TutorialDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return <Dialog title={t('Come funziona Enigmap')} className="tutorial-dialog" onClose={onClose}>
    <span className="tutorial-mark">?</span>
    <div className="eyebrow">{t('TRE PASSI, ZERO MISTERI')}</div>
    <h1>{t('La città è piena di domande.')}<br /><span>{t('Qui trovi le risposte.')}</span></h1>
    <div className="tutorial-steps">{steps.map(({ Icon, title, text }, index) => <div key={title}>
      <span><Icon size={21} /></span>
      <div><h2>{t(title)}</h2><p>{t(text)}</p></div>
      <small>{(index + 1).toString().padStart(2, '0')}</small>
    </div>)}</div>
    <section className="tutorial-transfer">
      <h2>{t('La tua indagine · ⋯')}</h2>
      <p>{t('Apri il menu ⋯ accanto ai progressi. Su telefono lo trovi nei Filtri.')}</p>
      <h3>{t('Trasferisci con codice')}</h3>
      <p>{t('Copia il codice e importalo sull’altro dispositivo: unisce le spunte e applica la lingua.')}</p>
      <h3>{t('Esporta / Importa progressi')}</h3>
      <p>{t('Esporta un file JSON come backup, poi importalo per aggiungere le spunte salvate. La lingua resta invariata.')}</p>
      <p>{t('Il trasferimento è manuale: i dispositivi non si sincronizzano automaticamente.')}</p>
    </section>
    <button className="primary-button" onClick={onClose}>{t('Inizia l’indagine')} <ArrowUpRight size={17} /></button>
  </Dialog>;
}
