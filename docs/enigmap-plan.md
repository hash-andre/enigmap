> Documento storico: conserva il piano iniziale, non la specifica corrente. Per lo stato attuale e i documenti di manutenzione vedere [l’indice](README.md).
>
> Scelte successive: inglese predefinito e italiano selezionabile; nessun sottotitolo; prove Catwoman escluse; cartografia vettoriale nera/antracite, zoom meno sensibile e nessun elenco dei punti. Progressi trasferibili manualmente con codice (spunte e lingua) o JSON (solo spunte); tutorial esteso a entrambi i metodi. La versione precedente resta nel tag `before-ui-revision`. I requisiti di accuratezza non ancora soddisfatti sono elencati nella [verifica dei contenuti](content-audit.md).

# Enigmap — documento di progetto

## Obiettivo e contenuti

Web app in italiano per completare tutte le attività dell’Enigmista in Batman: Arkham Knight, da PC e telefono. Comprende 179 trofei, 40 enigmi, 6 rivoltosi con bomba e 90 oggetti distruttibili: 315 elementi fisici, equivalenti a 243 sfide. Le 10 prove con Catwoman hanno un conteggio separato. Includere tutte le isole e gli interni, compresa la metropolitana di Port Adams. Escludere DLC e missioni secondarie estranee.

## Esperienza

- Intestazione: Enigmap, «Ogni enigma. Un passo più vicino.», pulsante Come funziona in alto a destra.
- Mappa scura, leggibile, con accenti verdi, trascinamento, zoom, raggruppamento dei punti e ripristino inquadratura.
- Icone per categoria; completati grigi con spunta. Filtri area, categoria, ricerca e Da completare.
- Selettore Gotham, interni e piani; ingressi nella mappa principale.
- Modal desktop ampio, a schermo intero su telefono: titolo, categoria, zona/piano, mini-mappa, ingresso/partenza, gadget, requisiti, soluzione italiana breve e completa, video facoltativo, fonti, casella Completato raggiungibile.
- Completamento reversibile, aggiornamento immediato, mantenimento di zoom e posizione chiudendo la scheda.
- Tutorial solo su richiesta: Scegli un punto; Segui la soluzione; Spunta Completato.

## Fonti e dati

- [PowerPyx](https://www.powerpyx.com/guides/batman-arkham-knight-trophy-guide.html): inventario, conteggi, video.
- [GamesRadar](https://www.gamesradar.com/batman-arkham-knight-riddler-guide/): posizioni e confronto soluzioni.
- [Gamer Guides](https://www.gamerguides.com/batman-arkham-knight/guide/collectibles-guide/collectible-locations/): coordinate, requisiti e procedure.
- [GameFAQs](https://gamefaqs.gamespot.com/ps4/768083-batman-arkham-knight/faqs/72018): interni e prove.

Inventario verificato per area/categoria, senza duplicati. Cartografia fedele con asset riutilizzabili o originale ricostruita dai riferimenti. Coordinate calibrate su riferimenti riconoscibili: nessuna posizione inventata. Soluzioni originali italiane con fonte per scheda, senza ripubblicare guide o immagini editoriali. Dati e cartografia non verificati non vanno presentati come completi.

Punti: ID stabile, categoria, area/piano, coordinate mappa e opzionali coordinate gioco, requisiti, passaggi, fonti, eventuali ingresso/partenza/destinazione. Gruppi degli oggetti distruttibili verificati, senza dedurli arbitrariamente dall’ordine editoriale.

## Tecnologia e progressi

React, TypeScript, Vite e Leaflet in coordinate piane. Sito statico senza account/backend. Catalogo, cartografia e progressi separati. Caricamento differito degli interni; nessun video caricato automaticamente.

localStorage con ID stabili e formato versionato; esportazione/importazione JSON da menu secondario. Validazione prima dell’unione, ID sconosciuti ignorati con riepilogo. File non validi non alterano i progressi. Dispositivi indipendenti, trasferimento manuale tramite file. Se il salvataggio non funziona, avviso breve ed esportazione disponibile.

## Ordine di lavoro

1. Salvare il documento.
2. Verificare catalogo e cartografia.
3. Implementare un flusso completo con ogni categoria e un interno.
4. Integrare e verificare l’intero catalogo.
5. Controllare responsività e pubblicare la versione verificata.

## Criteri di accettazione

- 315 elementi unici, più prove separate; riconciliazione delle 243 sfide.
- Ogni punto con posizione verificata, soluzione italiana, requisiti e fonte, senza segnaposto nella versione completa.
- Verificare interni, sovrapposizioni, piani, prove a tempo e partenze diverse dalla destinazione.
- Spunta/annullamento persistenti e contatori coerenti.
- Import/export senza perdita dati e gestione dei file malformati.
- Mouse, touch, tastiera; focus del modal e ritorno al controllo selezionato.
- Desktop e telefono da 360 px, senza overflow o comandi coperti.

Default concordati: italiano, tutto l’Enigmista, soluzioni subito visibili, salvataggio locale, nessun account. La completezza è requisito di consegna.
