# Enigmap

Web app statica in inglese e italiano per le attività dell’Enigmista in Batman: Arkham Knight.

## Anteprima locale con aggiornamento automatico

```sh
npm install
npm run dev
```

Apri **http://localhost:5173/**. Vite aggiorna componenti, CSS e dati automaticamente; per gli asset pubblici esegue il ricaricamento. Il controllo dei file usa polling a 250 ms. La porta è fissa: se occupata, il server segnala il problema senza spostare l’anteprima su un altro indirizzo.

Da un telefono sulla stessa rete locale usa l’indirizzo Network stampato da Vite. Il computer deve restare acceso e il firewall deve consentire la porta 5173. `npm run preview` serve la build finale e non include l’aggiornamento durante lo sviluppo.

## Contenuti e comportamento

315 elementi fisici (179 trofei, 40 enigmi, 90 distruttibili, 6 rivoltosi); 12 mappe vettoriali. Filtri, ricerca sulla mappa, raggruppamento dei marker, soluzioni italiane e fonti per scheda. Salvataggio locale, completamento reversibile, import/export JSON con validazione e unione.

Il totale delle sfide del gioco è 243: `179 + 40 + 6 + 90/5`. L’app mostra il progresso fisico su 315; non attribuisce i distruttibili a gruppi arbitrari né mostra un contatore parziale delle 243 sfide non verificato.

## Controlli

```sh
npm test
npm run build
npm run test:browser
```

Il controllo browser usa Brave in `/usr/bin/brave`, in un profilo temporaneo separato. Per un altro Chromium: `ENIGMAP_BROWSER=/percorso/chromium npm run test:browser`. Controlla desktop, telefono a 360 px, modal, salvataggio/annullamento, import malformati, blocco dello storage e aggiornamento CSS automatico. Gli screenshot vengono scritti in `/tmp/enigmap-*.png`.

## Dati e manutenzione

- `src/data/catalog.json`: catalogo distribuito, indipendente dall’accessibilità delle guide.
- `scripts/trophies.txt`, `scripts/other-points.txt`: note originali e istruzioni italiane.
- `scripts/build-maps.py`: geometrie originali e calibrazione riproducibile; nessuna immagine editoriale inclusa.
- `scripts/research.py` e `scripts/research-extra.py`: riferimenti pubblici scaricati esclusivamente in `/tmp/enigmap-research`; non servono durante build o utilizzo.

Per rigenerare il catalogo, prima raccogli i riferimenti con `python3 scripts/research.py`, poi esegui `python3 scripts/build-maps.py`, `python3 scripts/build-catalog.py`. Gli ID esistenti devono restare stabili per preservare i progressi.

## Stato della verifica

Inventario e funzionamento verificati automaticamente; soluzioni curate dalle guide. Gotham e gli interni usano mappe vettoriali ricostruite, con palette nera e grigio antracite. L’allineamento non è ancora validato direttamente nel gioco. Gli ingressi dei complessi e delle prove sono indicativi. Le limitazioni e le incongruenze note sono in [docs/content-audit.md](docs/content-audit.md), oltre che nelle schede interessate.

La versione locale è utilizzabile per revisione. La pubblicazione della versione completa prevista dal piano richiede il controllo della precisione cartografica e dei riferimenti per ogni punto; non è ancora stata eseguita.

Il documento di progetto concordato è in [docs/enigmap-plan.md](docs/enigmap-plan.md).

## Revisione UI e rollback

La versione originale è il commit `4803717`, tag `before-ui-revision`, sul ramo `main`. La revisione è sul ramo `ui/black-game-map`. Per tornare alla versione precedente: `git switch main`. Salvare o committare eventuali ulteriori modifiche prima del cambio ramo.

Questa revisione elimina elenco e prove Catwoman, mantiene i 315 elementi dell’Enigmista, usa mappa vettoriale e superfici nere e limita la sensibilità della rotella a 240 px per livello di zoom (prima 60). L’enigma della Batmobile, senza posizione fissa, rimane apribile dal pulsante sulla mappa.

La variante con screenshot è stata annullata solo per la mappa: `public/maps/gotham.svg` è nuovamente la cartografia attiva. `scripts/build-maps.py` genera geometrie e palette antracite per tutte le mappe. Il commit `3349de9` conserva la variante raster in Git.

## Lingua

L’inglese è predefinito al primo accesso, indipendentemente dalla lingua di sistema. Il pulsante EN/IT a destra di “How it works / Come funziona” cambia immediatamente interfaccia, schede, gadget, note e nomi delle stanze nelle mappe. La scelta viene salvata in `localStorage` con chiave `enigmap.language.v1`; se il salvataggio non è disponibile, il cambio funziona per la visita corrente. I progressi usano una chiave separata e gli stessi ID in entrambe le lingue. La ricerca riconosce nomi italiani e inglesi.

Le traduzioni delle 315 schede sono in `src/data/catalog.en.json`. Per rigenerarle dalle note inglesi originali (`scripts/trophies.en.txt`, `scripts/other-points.en.txt`), eseguire `python3 scripts/build-english.py` dopo la generazione del catalogo italiano. I passaggi nelle note inglesi sono separati da ` || `: il generatore verifica che ogni scheda mantenga lo stesso numero di punti della lista italiana, nello stesso ordine. `scripts/build-maps.py` genera anche le varianti `.en.svg` senza cambiare geometrie o coordinate.

`npm run test:language` verifica nel browser inglese predefinito, cambio lingua, persistenza al ricaricamento, progressi e inquadratura invariati, mappe tradotte e layout mobile a 360/390 px.
