import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import Dialog from './Dialog';

const sources = [
  { label: 'PowerPyx · inventario', url: 'https://www.powerpyx.com/guides/batman-arkham-knight-trophy-guide.html' },
  { label: 'Gamer Guides · coordinate e procedure', url: 'https://www.gamerguides.com/batman-arkham-knight/guide/collectibles-guide/collectible-locations/' },
  { label: 'GamesRadar · soluzioni e riferimenti', url: 'https://www.gamesradar.com/batman-arkham-knight-riddler-guide/' },
  { label: 'GameFAQs · guida di confronto', url: 'https://gamefaqs.gamespot.com/ps4/768083-batman-arkham-knight/faqs/72018' },
];

export default function SourcesDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return <Dialog title={t('Fonti e cartografia')} className="sources-dialog" onClose={onClose}>
    <div className="eyebrow">{t('DIETRO LA MAPPA')}</div>
    <h1>{t('Fonti e cartografia')}</h1>
    <p>{t('315 elementi fisici, equivalenti a 243 sfide: 179 trofei, 40 enigmi, 6 rivoltosi e 90 distruttibili (18 sfide).')}</p>
    <p>{t('Gotham e gli interni usano cartografia vettoriale ricostruita dai riferimenti del gioco. Le posizioni interne indicano stanza e piano; gli accessi ai complessi sono indicativi. Le note nelle schede segnalano coordinate discordanti.')}</p>
    <p>{t('Le schede sono controllate sulle guide, senza verifica diretta in gioco. Gotham e i suoi personaggi appartengono ai rispettivi titolari; Enigmap è un progetto non ufficiale.')}</p>
    <div className="source-links">{sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
      {t(source.label)}<ArrowUpRight size={15} />
    </a>)}</div>
    <p className="privacy-note">{t('I progressi sono salvati solo in questo browser. Dal menu ⋯ puoi esportarli e importarli su un altro dispositivo. La cancellazione dei dati del browser rimuove il salvataggio locale.')}</p>
  </Dialog>;
}
