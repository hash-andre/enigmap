# Revisione importazione progressi

Questa verifica riguarda il JSON dei progressi, non un ripristino generico del localStorage. Il file JSON non può cambiare lingua, catalogo, coordinate, soluzioni, URL o chiavi di salvataggio. Il codice di trasferimento è un percorso separato: unisce le spunte e applica anche la lingua, come descritto sotto.

## Esito

Nel percorso esaminato non è stato individuato un exploit riproducibile per eseguire JavaScript, inserire HTML o modificare prototipi tramite JSON. Già prima del refactoring venivano filtrati gli ID con il catalogo e non venivano uniti oggetti importati alla configurazione. Il refactoring rende questi vincoli espliciti e verificabili.

- Limite di 1.000.000 byte prima di leggere il file; limite anche sulla lunghezza del testo prima di JSON.parse.
- Oggetto con campi propri `app: "enigmap"`, `version: 1` e array `completed`.
- Massimo 10.000 voci, solo stringhe lunghe al massimo 128 caratteri.
- Solo gli ID esistenti nel catalogo entrano nello stato. Duplicati eliminati, ID sconosciuti conteggiati e scartati.
- I campi aggiuntivi, anche `__proto__`, non sono copiati nello stato né nel salvataggio. Non si effettuano merge ricorsivi, eval o interpretazione HTML dei dati importati.
- File non valido o lettura fallita: nessuna modifica ai progressi. Un file valido unisce i completamenti e non cancella quelli esistenti.
- Errori di lettura del browser sostituiti con un messaggio controllato.

Non sono necessarie librerie aggiuntive di sanitizzazione: i dati importati utilizzabili sono esclusivamente identificativi già noti. Mantenere questo confine se in futuro si aggiungono campi al formato.

## Verifiche

Test automatici per JSON malformati, versione errata, tipi annidati, array e stringhe eccessivi, limite prima della lettura, payload HTML/JavaScript e chiavi di prototype pollution. Test browser con payload malevolo, conservazione dei progressi dopo file troppo grande e ricaricamento. Verificati anche desktop, mobile, traduzioni, modal e salvataggio negato. `npm audit --omit=dev` non ha segnalato vulnerabilità nelle dipendenze di produzione al momento della revisione.

## Codice di trasferimento

Il codice è limitato a 256 caratteri in ingresso e deve contenere 63 caratteri dopo il trim esterno, prefisso `EN1-`, Base64url canonico, bit riservati a zero e CRC-32 valido. La decodifica produce solo gli ID del manifesto congelato e una delle due lingue. Nessun JSON o HTML viene interpretato tramite questo percorso. Un codice rifiutato non cambia spunte o lingua.

Il checksum rileva errori accidentali: non autentica l’autore e non cifra i progressi. I test coprono corruzione, versioni sconosciute, importazioni ripetute e persistenza fra sessioni isolate. Dettagli e compatibilità in [Transfer code v1](transfer-code.md).

## Limiti

Il file non è firmato: chiunque può costruire un JSON valido per segnare completamenti, comportamento previsto per un tracker personale. Un codice malevolo già in esecuzione sulla stessa origine potrebbe leggere o modificare localStorage; il parser non protegge da una compromissione indipendente del sito o del browser. Questa revisione riguarda il percorso d’importazione e non costituisce un penetration test completo.

Riferimenti: [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse), [prototype pollution](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution), [HTML non attendibile in React](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html).
