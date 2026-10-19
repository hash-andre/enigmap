# Enigmap: tutte le tecnologie, una alla volta

Questa guida spiega il progetto reale, non uno stack ideale. L’obiettivo è capire ogni voce del `package.json`, seguire il percorso dal codice alla pagina e ricavarne materiale accurato per un blog o LinkedIn.

Gli esempi brevi sono didattici; i collegamenti ai file indicano l’implementazione effettiva. Le versioni riportate più avanti sono quelle del lockfile al momento della stesura, non un invito ad aggiornare ogni pacchetto all’ultima versione.

## Prima di iniziare: cosa succede quando uso il sito?

1. Un hosting consegna HTML, CSS, JavaScript, immagini e dati del catalogo.
2. Il browser esegue JavaScript. React costruisce l’interfaccia e Leaflet gestisce la mappa.
3. Quando spunto un punto, cambia lo stato in memoria: marker e contatori vengono aggiornati.
4. Il nuovo insieme di ID viene salvato nel `localStorage` di quel browser.
5. Se voglio trasferire il salvataggio, copio un codice oppure esporto un JSON. Il secondo dispositivo importa una fotografia di quei progressi.

È un’applicazione **statica nella distribuzione, interattiva nel browser**. “Statica” descrive il modo in cui viene servita, non l’assenza di pulsanti o dati modificabili. L’hosting non conserva un profilo dell’utente: questa versione non ha un backend applicativo.

## 1. Node.js: eseguire JavaScript fuori dal browser

**Cos’è.** Un ambiente che esegue JavaScript sul computer. Il browser possiede documenti e finestre; Node offre, fra le altre cose, accesso a file, processi e strumenti di sviluppo.

**Perché è qui.** Avvia Vite, il compilatore TypeScript e i controlli automatici. Anche gli script `.mjs` che guidano Brave vengono eseguiti con Node.

```sh
node scripts/check-transfer.mjs
```

Questo comando esegue un programma locale che apre un browser di prova. Non avvia il backend di Enigmap.

**Dove gira.** Sul computer di chi sviluppa e nell’ambiente che costruisce il sito per il deploy. Chi apre il sito pubblicato non deve installarlo.

**Perché non compare fra le dipendenze.** È il programma che esegue i pacchetti, non una libreria che l’app importa. Sul computer usato per il progetto è stata verificata la versione Node 24.

## 2. npm: installazione e comandi del progetto

**Cos’è.** Il gestore di pacchetti usato qui. Scarica librerie e strumenti, risolve le loro dipendenze e avvia i comandi dichiarati in `scripts`.

```sh
npm install
npm ci
npm run dev
```

`npm install` installa i pacchetti e può aggiornare il lockfile secondo le richieste del progetto. `npm ci` richiede un lockfile coerente, ricrea `node_modules` e non riscrive il manifesto o il lockfile: è adatto a controlli ripetibili e build su hosting.

`npm run dev` cerca la voce `dev` in `package.json`. npm rende disponibili gli eseguibili locali in `node_modules/.bin`, quindi non serve installare Vite globalmente.

**Perché serve.** Evita di scaricare e collegare manualmente ogni libreria, inclusi i pacchetti che le librerie richiedono a loro volta. `node_modules` si rigenera: non va pubblicato nel repository.

Riferimenti: [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

## 3. package.json: la scheda del progetto

Non contiene l’applicazione e non configura da solo un hosting. Descrive il progetto, gli strumenti richiesti e i comandi disponibili.

| Campo | Significato concreto in Enigmap |
|---|---|
| `name: "enigmap"` | Nome del pacchetto/progetto. Non registra un dominio e non crea un repository GitHub. |
| `version: "0.1.0"` | Versione dichiarata dell’app. Non cambia automaticamente a ogni commit e non coincide con la versione del codice di trasferimento. |
| `private: true` | Impedisce la pubblicazione accidentale con npm. Non rende privato GitHub e non impedisce un sito pubblico. |
| `type: "module"` | Indica a Node di interpretare i file `.js` del pacchetto come moduli ECMAScript. |
| `scripts` | Scorciatoie per avviare sviluppo, build e controlli. |
| `dependencies` | Librerie usate dall’applicazione distribuita. |
| `devDependencies` | Strumenti per costruire, controllare e provare il progetto. |
| `license: "0BSD"` | Identificatore della licenza, il cui testo è nel file `LICENSE`. |

`private` e `license` rispondono a domande diverse: il primo regola una pubblicazione npm, la seconda i permessi di riuso del codice.

Riferimento: [package.json, documentazione npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/).

## 4. Versioni: perché ci sono ^ e ~?

Una versione come `19.0.0` ha tre componenti: major, minor e patch. I simboli nel manifesto esprimono un intervallo accettabile, non necessariamente la versione oggi installata.

| Richiesta nel progetto | Intervallo ammesso |
|---|---|
| `react: ^19.0.0` | Da `19.0.0` incluso a `20.0.0` escluso. |
| `leaflet: ^1.9.4` | Da `1.9.4` incluso a `2.0.0` escluso. |
| `typescript: ~5.7.2` | Da `5.7.2` incluso a `5.8.0` escluso. |
| `lucide-react: ^0.468.0` | Da `0.468.0` incluso a `0.469.0` escluso. |

Il caso di Lucide è istruttivo: con una major zero il caret è più restrittivo. Non va tradotto automaticamente con “tutte le versioni fino alla prossima major”.

Questi intervalli seguono convenzioni di compatibilità, ma non garantiscono che un aggiornamento sia privo di bug o cambiamenti indesiderati: dopo un aggiornamento si eseguono i controlli.

Riferimento: [node-semver, implementazione usata da npm](https://github.com/npm/node-semver#ranges).

## 5. package-lock.json: una fotografia delle dipendenze

`package.json` dice quali versioni sono ammesse; `package-lock.json` registra l’albero risolto, comprese dipendenze indirette, versioni e informazioni di integrità.

Nel nostro caso `^19.0.0` ha risolto React a `19.3.1`. Un altro pacchetto può essere rimasto esattamente alla versione minima richiesta.

**Perché lo teniamo in Git.** Permette a un altro sviluppatore e al servizio di build di ricostruire lo stesso albero tramite `npm ci`, invece di scegliere ogni volta nuove versioni compatibili con gli intervalli. Ambiente, piattaforma e strumenti devono comunque essere compatibili: il lockfile non rende identici computer diversi.

Non si dovrebbe cancellarlo per “pulire il progetto” né modificarne a mano le versioni. Va aggiornato consapevolmente con npm e verificato insieme al manifesto.

Riferimento: [package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/).

### Versioni effettive del progetto

Questa tabella confronta le richieste con il lockfile verificato alla stesura. Sono versioni del progetto, non indicazioni su quali siano le ultime release disponibili.

| Pacchetto | Richiesta | Versione nel lockfile | Ruolo |
|---|---|---|---|
| `leaflet` | `^1.9.4` | `1.9.4` | Applicazione |
| `leaflet.markercluster` | `^1.5.3` | `1.5.3` | Applicazione |
| `lucide-react` | `^0.468.0` | `0.468.0` | Applicazione |
| `react` | `^19.0.0` | `19.3.1` | Applicazione |
| `react-dom` | `^19.0.0` | `19.3.1` | Applicazione |
| `@types/leaflet` | `^1.9.15` | `1.9.22` | Sviluppo/build/test |
| `@types/leaflet.markercluster` | `^1.5.5` | `1.5.6` | Sviluppo/build/test |
| `@types/react` | `^19.0.0` | `19.3.0` | Sviluppo/build/test |
| `@types/react-dom` | `^19.0.0` | `19.3.0` | Sviluppo/build/test |
| `@vitejs/plugin-react` | `^4.3.4` | `4.7.0` | Sviluppo/build/test |
| `@playwright/test` | `^1.49.1` | `1.64.1` | Sviluppo/build/test |
| `tsx` | `^4.19.2` | `4.23.15` | Sviluppo/build/test |
| `typescript` | `~5.7.2` | `5.7.3` | Sviluppo/build/test |
| `vite` | `^6.0.5` | `6.4.4` | Sviluppo/build/test |

## 6. dependencies e devDependencies: quando servono?

React, Leaflet e Lucide vengono importati dal codice del sito. Vite e TypeScript servono a produrre il sito; Playwright serve a verificarlo. Tutti possono dover essere installati nell’ambiente di build, ma non tutti vengono consegnati al browser.

La distinzione non significa che in produzione debbano esserci due cartelle di pacchetti. Per Enigmap si installano gli strumenti, si costruisce `dist/` e si pubblica quella cartella: il browser scarica i file risultanti, non `node_modules`.

Per questo fare `npm ci --omit=dev` **prima** della build impedirebbe di trovare Vite e TypeScript. Il fatto che siano strumenti di sviluppo non li rende inutili al deploy: sono necessari alla fase di costruzione.

Ci sono anche dipendenze transitive: per esempio Vite 6 porta con sé esbuild e Rollup. Non occorre duplicarle fra le dipendenze dirette se non le utilizziamo direttamente.

## 7. Moduli ESM: import ed export

```ts
import { encodeTransferCode } from './transfer';
export function example() { /* ... */ }
```

I moduli dividono il programma in parti con dipendenze esplicite. In Enigmap ci permettono di separare interfaccia, catalogo, salvataggio e codifica del trasferimento.

`"type": "module"` riguarda soprattutto l’interpretazione dei file JavaScript da parte di Node. I file `.mjs` sono esplicitamente moduli; `.ts` e `.tsx` vengono trattati dai nostri strumenti di compilazione/esecuzione. Il browser pubblicato riceve JavaScript trasformato da Vite, non TypeScript grezzo.

**Perché è utile.** Una funzione pura come il decoder può essere importata dai test senza dover aprire la mappa. Questa separazione è anche il presupposto per includere nella build soltanto il codice necessario, nei limiti consentiti dai pacchetti e dai loro effetti collaterali.

## 8. react: stato e componenti dell’interfaccia

**Cos’è.** Una libreria per descrivere interfacce mediante componenti e dati. Invece di cambiare manualmente ogni etichetta quando una spunta varia, descriviamo cosa mostrare per lo stato corrente.

**Perché è qui.** La stessa spunta influenza marker, contatori e scheda. Tenere una sorgente di stato condivisa riduce il rischio che questi elementi mostrino informazioni diverse.

Esempio didattico:

```tsx
const [completed, setCompleted] = useState(false);
return <button onClick={() => setCompleted(value => !value)}>
  {completed ? 'Completed' : 'Mark completed'}
</button>;
```

Nel progetto lo stato è un insieme di ID, non un singolo booleano. `useProgress` lo gestisce; componenti come `PointDialog` e `TransferDialog` lo ricevono e notificano le azioni attraverso callback.

**Dove gira.** Nel browser. React non salva automaticamente nulla e non sincronizza dispositivi: queste sono responsabilità del nostro codice.

**Limite.** È una scelta utile per coordinare la UI, non un requisito inevitabile per un tracker: si potrebbe costruire anche con JavaScript senza React.

Riferimento: [React, Quick Start](https://react.dev/learn).

## 9. Gli hook React usati da Enigmap

Questa parte riguarda l’uso concreto di React nei nostri file.

- `useState` mantiene progressi, filtri e apertura dei modal fra i render.
- `useEffect` collega lo stato a effetti esterni: scrittura in localStorage, eventi e avvio/distruzione della mappa.
- `useRef` conserva riferimenti a elementi HTML o all’istanza Leaflet senza usarli come dati da mostrare. Cambiare un ref non provoca da solo un render.
- `useMemo` evita alcuni ricalcoli quando le dipendenze non cambiano: filtri, dati tradotti e codice di trasferimento.
- `createContext` e `useContext` rendono lingua e funzione di traduzione disponibili ai componenti.

Un **custom hook** come `useProgress` è una funzione nostra che combina hook React. Non è un altro pacchetto npm e non rende automaticamente globale lo stato: attualmente viene chiamato dal componente principale e i risultati vengono passati agli altri componenti.

`StrictMode`, nel punto d’ingresso, aiuta a individuare alcuni problemi durante lo sviluppo, anche ripetendo determinati cicli di esecuzione e pulizia. Per questo l’integrazione Leaflet deve poter creare e rimuovere una mappa correttamente.

Riferimenti: [hook React](https://react.dev/reference/react/hooks), [StrictMode](https://react.dev/reference/react/StrictMode).

## 10. react-dom: collegare React alla pagina

React descrive i componenti; `react-dom` li rende nel DOM, cioè nella struttura di elementi che il browser visualizza.

Il punto d’ingresso usa questo collegamento:

```tsx
createRoot(document.getElementById('root')!).render(/* componenti */);
```

Il contenitore `root` è in `index.html`. L’import viene da `react-dom/client`: non è una dipendenza separata da installare, ma un punto d’accesso del pacchetto `react-dom`.

**Perché compare separatamente.** React può avere renderer per ambienti diversi. Per questa pagina web serve quello del browser.

**Cosa non stiamo usando.** Non abbiamo rendering HTML sul server o idratazione di contenuto generato da un backend. L’app viene montata nel browser. `react` e `react-dom` nel lockfile sono entrambi `19.3.1`.

Riferimento: [createRoot](https://react.dev/reference/react-dom/client/createRoot).

## 11. leaflet: rendere interattiva la mappa

**Cos’è.** Una libreria di mappe con trascinamento, zoom, livelli, marker e gestione degli eventi.

**Perché è qui.** Scrivere da zero zoom sotto il puntatore, trascinamento touch, marker posizionati e ricalcolo dopo un resize avrebbe richiesto molto codice delicato.

Enigmap usa `L.CRS.Simple`: un sistema piano adatto a una mappa di gioco. Non usa latitudine e longitudine terrestri, non richiede Google Maps e non scarica tasselli geografici. Le mappe SVG locali vengono mostrate tramite `L.imageOverlay`.

Nel componente `MapView` convertiamo le coordinate del catalogo in quelle attese da Leaflet: `[x, y]` diventa `[-y, x]`. La conversione tiene conto dell’origine in alto delle immagini e dell’ordine delle coordinate della libreria.

**Dove gira.** Nel browser. React conserva un riferimento alla mappa e la rimuove durante la pulizia del componente.

**Limite concreto.** Leaflet gestisce l’interazione, non verifica che il trofeo sia realmente nella stanza indicata: l’accuratezza dipende dal catalogo e dalla cartografia.

Riferimento: [Leaflet, mappe non geografiche](https://leafletjs.com/examples/crs-simple/crs-simple.html).

## 12. leaflet.markercluster: raggruppare i punti

**Cos’è.** Un plugin che aggiunge a Leaflet il raggruppamento dei marker vicini.

A basso zoom molti punti della stessa zona si sovrapporrebbero. Il plugin li rappresenta con un gruppo numerato. Ingrandendo, i punti tornano distinguibili.

**Perché è separato da Leaflet.** È un’estensione: importare solo Leaflet non rende disponibile `L.markerClusterGroup`.

**Nel progetto.** La mappa principale usa i gruppi; la mini-mappa della scheda usa invece un semplice `L.layerGroup`. Il nostro codice determina anche se tutti i punti di un gruppo sono completati per mostrarlo in grigio.

**Cosa non fa.** Non fonde i record, non cambia il conteggio delle sfide e non verifica duplicati nel catalogo. È una presentazione temporanea di più marker. Per estendere questo comportamento esistono pacchetti di tipi dedicati, spiegati più avanti.

Riferimento: [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster).

## 13. lucide-react: icone coerenti

**Cos’è.** Una raccolta di icone SVG esposte come componenti React.

```tsx
import { Copy } from 'lucide-react';
<Copy size={16} />
```

**Perché è qui.** Copia, zoom, filtri, lingua, completamento e chiusura hanno simboli con lo stesso stile. Dimensione, colore e spessore si controllano senza esportare decine di PNG.

Gli import nominati permettono al sistema di build di eliminare codice di icone non usate quando la struttura del pacchetto lo consente. Non stiamo caricando un font di icone da un servizio esterno.

**Distinzione importante.** Le icone React della UI arrivano da Lucide. I marker Leaflet usano anche stringhe SVG nostre in `Icons.tsx`, perché Leaflet costruisce quelle parti fuori dal normale rendering React. Il logo Batman è un asset separato, non un’icona fornita da Lucide.

**Limite.** Un’icona da sola non dà un nome accessibile al pulsante: nel codice servono testo o attributi come `aria-label`.

Riferimento: [Lucide per React](https://lucide.dev/guide/react).

## 14. typescript: controllare i contratti prima dell’esecuzione

**Cos’è.** JavaScript con un sistema di tipi verificato prima di eseguire l’app.

```ts
type Language = 'en' | 'it';
```

Questo contratto aiuta a trovare assegnazioni sbagliate e chiamate incoerenti. Le interfacce `Point` e `MapDefinition` descrivono i dati che i componenti si aspettano.

**Perché è qui.** Coordinate, categorie, lingue e callback attraversano molti file. È più facile correggere una proprietà errata durante la build che dopo aver aperto una scheda sul telefono.

**Dove gira.** Il pacchetto TypeScript fornisce `tsc`, usato per i controlli. I tipi vengono rimossi dal JavaScript distribuito.

**Il limite da capire bene.** Scrivere `value as Point` non controlla un file ricevuto dall’utente: dice al compilatore di fidarsi. La validazione del JSON e del codice di trasferimento è codice JavaScript esplicito. TypeScript non sostituisce quei controlli e non verifica da solo la correttezza delle soluzioni del gioco.

Riferimento: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

## 15. tsconfig.json: quali controlli abbiamo scelto

Non è una libreria: è la configurazione del compilatore già presente nel progetto.

| Opzione | Perché è configurata così |
|---|---|
| `strict: true` | Attiva controlli rigorosi, anche su valori potenzialmente nulli. |
| `noEmit: true` | `tsc` controlla senza produrre il JavaScript del sito; lo produce Vite. |
| `jsx: "react-jsx"` | Configura il supporto alla sintassi JSX e al runtime automatico React. |
| `resolveJsonModule: true` | Consente import dei cataloghi JSON. Non li valida rispetto alle regole del gioco. |
| `moduleResolution: "Bundler"` | Usa regole di risoluzione pensate per un progetto elaborato da un bundler. |
| `module: "ESNext"` | Configura l’uso dei moduli moderni. |
| `target: "ES2022"` | Definisce il riferimento del compilatore per il linguaggio; con `noEmit` non è il comando che trasforma la build. |
| `lib: ["ES2022", "DOM", "DOM.Iterable"]` | Rende note al compilatore le API JavaScript e del browser usate qui. Non installa polyfill. |
| `skipLibCheck: true` | Salta il controllo interno dei file di dichiarazioni delle librerie; non disattiva quello dei nostri file. |
| `esModuleInterop: true` | Agevola l’interoperabilità dei tipi fra forme di moduli differenti. |
| `allowImportingTsExtensions: true` | Consente riferimenti espliciti a file `.ts` nell’impostazione senza emissione. |
| `include` | Limita i file del progetto controllati a `src` e alla configurazione Vite. |

Riferimento: [opzioni TypeScript](https://www.typescriptlang.org/tsconfig/).

## 16. vite: sviluppo e produzione

**Cos’è.** Il sistema che avvia l’ambiente locale e prepara i file distribuibili.

**Durante lo sviluppo.** Serve i moduli al browser e rileva le modifiche. L’aggiornamento HMR evita di ricostruire tutta l’app a ogni cambiamento; alcuni aggiornamenti richiedono comunque un ricaricamento.

**Durante la build.** Trasforma TypeScript/JSX e risolve import, CSS e asset in file pubblicabili in `dist/`. I nomi con hash permettono di distinguere asset prodotti da build differenti.

**Perché è qui.** Senza Vite dovremmo sostituire trasformazione, server locale, aggiornamenti e preparazione degli asset con altri strumenti o script. Non è necessario che il sito pubblico esegua Vite.

Questa versione del progetto usa **Vite 6**, con esbuild e Rollup fra le dipendenze risolte. Non bisogna descriverla copiando l’architettura di una diversa major di Vite.

**Limite.** Trasformare TypeScript non equivale a verificarne i tipi: per questo la build esegue anche `tsc`.

Riferimenti: [build e deploy Vite](https://vite.dev/guide/static-deploy.html), versioni effettive in `package-lock.json`.

## 17. vite.config.ts: perché la configurazione esiste

Queste impostazioni rispondono alle richieste di anteprima live del progetto:

| Impostazione | Effetto concreto |
|---|---|
| `host: '0.0.0.0'` | Ascolta sulle interfacce di rete: il telefono può raggiungere il computer sulla stessa rete, se consentito. Non crea un URL pubblico. |
| `port: 5173`, `strictPort: true` | Usa una porta stabile e segnala se è occupata, invece di cambiare indirizzo. |
| `open: true` | Richiede l’apertura del browser all’avvio del server locale. |
| `hmr: true` | Abilita gli aggiornamenti durante lo sviluppo. |
| `watch.usePolling: true` | Controlla periodicamente i file, utile nell’ambiente locale usato; consuma più risorse rispetto agli eventi del filesystem. |
| `watch.interval: 250` | Intervallo di controllo in millisecondi, non frequenza di salvataggio dei progressi. |
| `manualChunks` | Separa il codice costruito in gruppi per Leaflet, React e cataloghi. |

I chunk distinti non implicano che tutto venga caricato soltanto su richiesta. Qui gli import principali restano statici; gli interni come immagini vengono richiesti quando cambia mappa.

## 18. @vitejs/plugin-react: collegare Vite e React

**Cos’è.** Il plugin ufficiale che integra il progetto React nella pipeline Vite.

```ts
plugins: [react()]
```

**Perché è qui.** Gestisce l’integrazione con il runtime JSX e abilita React Fast Refresh in sviluppo. Cambiando un componente possiamo vedere l’aggiornamento, spesso conservando lo stato locale quando il tipo di modifica lo permette.

**Differenza rispetto a React.** React esegue i componenti; il plugin prepara il codice e gli aggiornamenti durante il lavoro. Non è una seconda copia del framework e non implementa le funzioni della mappa.

**Dove gira.** Nella configurazione e nella pipeline di sviluppo/build. Non è una libreria che i visitatori devono installare.

**È rimovibile?** Solo sostituendo o riconfigurando il suo ruolo. Cancellarlo dal manifesto lasciando `import react from '@vitejs/plugin-react'` renderebbe la configurazione non risolvibile.

Riferimento: [vite-plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react). Le funzionalità opzionali delle release più recenti non sono automaticamente attive nel nostro plugin 4.

## 19. @types/react: descrivere React a TypeScript

Contiene dichiarazioni di tipi, non il codice che disegna i componenti.

**Perché è qui.** TypeScript deve conoscere proprietà dei componenti, hook ed eventi. Nel nostro codice compaiono, fra gli altri, `ReactNode`, `CSSProperties` e `FormEvent`.

```ts
import type { FormEvent } from 'react';
```

Il tipo viene risolto attraverso le dichiarazioni disponibili, non diventa JavaScript da scaricare.

**Se lo togliamo.** Il browser non perde una funzione di React già costruita, ma i controlli TypeScript del progetto possono fallire o perdere informazioni essenziali. Non va eliminato perché “non si vede nell’interfaccia”.

## 20. @types/react-dom: descrivere il renderer

Completa il punto precedente per `react-dom`, incluso `createRoot`.

**Perché è distinto.** Le dichiarazioni seguono la divisione dei pacchetti che descrivono: una cosa è React, un’altra il collegamento al DOM del browser.

Anche questo pacchetto è uno strumento di sviluppo: documenta al compilatore come usare un’API, non implementa quell’API. Le major dei tipi vanno mantenute compatibili con quelle delle librerie.

## 21. @types/leaflet: descrivere mappe e livelli

Permette di usare tipi come `L.Map`, `L.LatLngTuple` e `L.ImageOverlay` nel componente `MapView`.

**Perché serve.** L’integrazione passa coordinate e riferimenti fra React e Leaflet: i tipi aiutano a riconoscere proprietà inesistenti e valori incompatibili.

La versione di un pacchetto `@types` può differire da quella eseguibile: nel lockfile abbiamo Leaflet `1.9.4` e dichiarazioni `1.9.22`. I numeri non indicano che siano installati due motori di mappe.

## 22. @types/leaflet.markercluster: descrivere l’estensione

Dichiara le API aggiunte dal plugin, come `L.markerClusterGroup`, oltre a opzioni e tipi dei gruppi.

**Perché non basta @types/leaflet.** Il pacchetto principale non può descrivere automaticamente tutti i plugin esterni. Il codice del plugin e le sue dichiarazioni devono essere entrambi disponibili nel ruolo appropriato.

In generale i pacchetti `@types` derivano dalle definizioni distribuite nell’ecosistema DefinitelyTyped. Se una libreria include già dichiarazioni adeguate, può non essere necessario installarne una copia separata: qui questi quattro pacchetti sono quelli utilizzati dalla configurazione corrente.

Riferimento per i quattro capitoli: [consumare dichiarazioni TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html).

## 23. tsx: eseguire i test TypeScript con Node

**Cos’è.** Uno strumento per eseguire TypeScript tramite Node senza una compilazione manuale preliminare dei file di test.

**Perché è qui.** I test importano direttamente moduli `.ts` del progetto. Il comando usa:

```sh
node --import tsx -e "await import('./tests/transfer.test.ts')"
```

`--import tsx` carica il supporto prima del programma. `-e` chiede a Node di eseguire il testo passato sulla riga di comando. Il test può così importare il decoder reale e provarlo senza Vite o un browser.

**Da non confondere.** Il pacchetto npm `tsx` è uno strumento di esecuzione; l’estensione `.tsx` indica un file TypeScript che può contenere JSX. Sono collegati per contesto, ma non sono la stessa cosa.

**Limite.** Eseguire TypeScript non equivale al controllo statico completo di `tsc`. Non lo sostituiamo nella build.

Riferimento: [tsx](https://github.com/privatenumber/tsx).

## 24. node:test e node:assert: i controlli senza browser

I test di catalogo, progressi, lingua e trasferimento importano moduli inclusi in Node. Non sono dipendenze da aggiungere al `package.json`.

`node:test` organizza i casi; `node:assert/strict` verifica condizioni ed uguaglianze, sollevando errori se il risultato non è quello atteso.

Nel progetto controllano, per esempio, 315 ID unici, rigetto di JSON malformati, conservazione dei passaggi tradotti e corrispondenza di ogni bit al suo collezionabile. Per il CRC esistono anche risultati attesi generati indipendentemente con Python, per evitare che encoder e decoder condividano lo stesso errore senza accorgersene.

Il nostro script importa esplicitamente i file di test con Node e `tsx`; non invoca Vitest o Jest. I risultati correnti comprendono 18 casi. Quando si aggiunge un file di test va incluso nel comando, oppure va cambiato consapevolmente il sistema di scoperta.

Riferimento: [test runner Node](https://nodejs.org/api/test.html).

## 25. @playwright/test: verificare il comportamento reale nel browser

**Cos’è.** Un toolkit per test end-to-end, comprensivo di API di automazione browser e di un test runner dedicato.

**Uso effettivo qui.** Gli script `.mjs` importano `chromium` da questo pacchetto e guidano direttamente Brave, con controlli `node:assert`. Non stiamo usando una configurazione `playwright.config` o il comando `playwright test`.

**Perché serve.** Un decoder corretto non dimostra che il pulsante importi davvero, che il modal abbia focus o che il layout funzioni a 360 px. Gli script cliccano, compilano campi, ricaricano e verificano il risultato.

Le sessioni isolate simulano due dispositivi con salvataggi separati; non modificano il profilo personale dell’utente. `ENIGMAP_BROWSER` consente di scegliere un altro Chromium installato.

**Limite e possibile semplificazione.** Il pacchetto offre più funzioni di quelle attualmente usate. Si potrebbe passare alla sola libreria `playwright` o adottare il runner completo, ma sarebbe una modifica da verificare, non una dipendenza inutilizzata da cancellare.

Riferimento: [Playwright Library e Test](https://playwright.dev/docs/library).

## 26. scripts: leggere tutti i comandi

Queste voci coordinano le tecnologie già spiegate. Non sono altre librerie. Il carattere `:` in `test:transfer` è solo parte del nome della scorciatoia.

### dev

```sh
vite --host 0.0.0.0
```

Avvia il server di sviluppo. L’opzione di rete è presente anche nella configurazione: è ridondante ma coerente. Il riferimento locale è `http://localhost:5173`; sul telefono serve l’indirizzo di rete del computer. Un localhost aperto sul telefono indica il telefono stesso.

### build

```sh
tsc -b && vite build
```

Prima TypeScript controlla il progetto in modalità build. `&&` esegue il secondo comando soltanto se il primo termina correttamente. Poi Vite produce `dist/`. Con `noEmit`, `tsc` non produce il JavaScript applicativo; può comunque creare metadati incrementali `.tsbuildinfo`, ignorati da Git. `-b` non indica una build del backend.

### preview

```sh
vite preview --host 0.0.0.0
```

Serve localmente la build già generata. Non ricostruisce il sito e non è il server di produzione. È utile per controllare ciò che verrà effettivamente distribuito.

### test

```sh
node --import tsx -e "await import('./tests/catalog.test.ts'); await import('./tests/progress.test.ts'); await import('./tests/language.test.ts'); await import('./tests/transfer.test.ts')"
```

Registra ed esegue i test di logica senza aprire la pagina. Gli `await import` caricano i file indicati; non sono richieste a un server.

### test:browser

```sh
node scripts/check-browser.mjs
```

Controlla desktop, telefono, zoom, modal, completamento, persistenza, JSON ostile e salvataggio negato. Verifica anche l’aggiornamento CSS live, aggiungendo temporaneamente una regola e ripristinando il file: è un controllo da eseguire sull’ambiente di sviluppo.

### test:language

```sh
node scripts/check-language.mjs
```

Controlla inglese predefinito, preferenza ricordata, passaggio EN/IT, posizione della mappa e liste numerate delle soluzioni.

### test:transfer

```sh
node scripts/check-transfer.mjs
```

Verifica codice, copia e ripiego manuale, trasferimento fra sessioni, unione, lingua, errori e persistenza.

### test:categories

```sh
node scripts/check-categories.mjs
```

Verifica le 16 combinazioni delle quattro categorie, tutte inizialmente spuntate, i marker esclusi, il ripristino, il cambio lingua e l’uso da tastiera su desktop e telefono. Le categorie si combinano liberamente: non sono una selezione esclusiva. Ricaricare la pagina le riattiva tutte.

### test:pages

```sh
npm run build -- --base /enigmap/ && node scripts/check-pages.mjs
```

Costruisce il sito con lo stesso sottopercorso del repository Pages e lo serve su una porta temporanea con percorsi rigorosi, senza fallback. Verifica che asset e navigazione mantengano il prefisso, anche nelle mappe interne e su telefono. Il test avvia e chiude da solo il server di prova.

`test:browser`, `test:language`, `test:transfer` e `test:categories` richiedono il server di sviluppo su localhost. Tutti i controlli browser richiedono Chromium installato. `npm test` e la build non ne hanno bisogno.

Riferimento per il meccanismo dei comandi: [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/).

## 27. HTML e dialog: struttura e finestre modali

HTML definisce contenitori, pulsanti, campi, etichette e relazioni accessibili. React produce questi elementi, non sostituisce il linguaggio della pagina.

Il componente condiviso `Dialog` usa l’elemento nativo `<dialog>` e `showModal()`. Il browser gestisce il livello modale e parte del comportamento da tastiera. Il nostro codice collega la chiusura, blocca lo scorrimento della pagina e ripristina il focus sul controllo precedente o sul selettore della mappa.

**Perché è utile.** Evita di ricostruire ogni modal con normali div e di implementare da zero tutte le interazioni. La scheda punto, il tutorial e il trasferimento condividono questo comportamento.

**Limite.** Un elemento nativo non rende automaticamente perfetto tutto il layout o il testo accessibile: etichette, focus e scorrimento vengono comunque verificati. I campi del codice hanno altezza fissa e `resize: none`, per evitare che il ridimensionamento manuale deformi il modal.

Riferimento: [elemento dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

## 28. CSS: layout responsive e tema

CSS definisce posizione, dimensioni, colori e comportamento visivo. Enigmap usa CSS scritto nel progetto, senza Tailwind, Bootstrap o un framework di componenti.

Flexbox e Grid organizzano intestazione, controlli e schede. Le media query cambiano il layout sul telefono: filtri in pannello, modal a schermo intero e sfondo dedicato. Le proprietà personalizzate, come `--green`, condividono alcuni valori del tema.

**Perché questa scelta.** Il progetto ha poche schermate e una direzione visiva precisa: una dipendenza per l’intero design system non era necessaria.

`100dvh` tiene conto dell’altezza dinamica della finestra mobile; le aree che possono superare lo spazio disponibile scorrono. Le immagini di sfondo desktop/mobile sono asset PNG distinti e hanno sovrapposizioni scure per la leggibilità.

**Limite.** Il foglio attuale include ancora molte regole compatte e override: funziona, ma un’ulteriore crescita renderebbe utile una separazione per componenti. Responsive non significa che sia stata provata ogni combinazione di browser, tastiera e schermo.

## 29. SVG: mappe vettoriali e marker

SVG rappresenta forme, tracciati e testo con istruzioni geometriche. A differenza di uno screenshot, una costa descritta da un tracciato mantiene bordi nitidi mentre viene ingrandita.

**Dove lo usiamo.** Cartografia, simboli dei marker, favicon e logo. Le mappe hanno varianti con etichette italiane e inglesi; i progressi fanno riferimento agli stessi ID in entrambe.

**Perché è qui.** Possiamo controllare colore dell’acqua, strade, trasparenza e testi, adattandoli alla UI scura. Le mappe sono asset locali, non fotografie editoriali incorporate.

**Limite importante.** Vettoriale non significa accurato: un tracciato approssimativo resta approssimativo. Né il formato concede automaticamente diritti su loghi o contenuti rappresentati. La validazione geografica è descritta nell’audit, separatamente dalla qualità del rendering.

Leaflet può inserire HTML/SVG nei marker. Nel nostro percorso di importazione le stringhe ricevute dall’utente non diventano il markup dei marker: vengono accettati solo ID conosciuti.

## 30. JSON: catalogo ed esportazione

JSON è un formato di dati testuale. Non è un database e non esegue istruzioni.

Abbiamo due usi distinti: il catalogo incluso nell’app, con posizioni e soluzioni, e il file personale esportato, con identificativi dei completamenti. Il secondo non consente di sovrascrivere le schede del catalogo.

**Perché è utile.** È leggibile, trasferibile e supportato direttamente da JavaScript e Python. Per 315 elementi un database remoto non è indispensabile.

L’importazione verifica dimensioni e struttura prima di unire gli ID riconosciuti. Un oggetto con campi inattesi non diventa una configurazione dell’app. Eventuali campi sconosciuti non sono interpretati come HTML o percorsi di proprietà da aggiornare.

**Limite.** Modificare manualmente un file valido può segnare punti come completati: il tracker non è una certificazione del risultato ottenuto nel gioco. Per questo la validazione riguarda sicurezza e coerenza del formato, non l’autenticità dell’impresa.

## 31. localStorage: persistenza senza account

**Cos’è.** Una memoria persistente del browser con chiavi e valori testuali, separata per origine e profilo.

In Enigmap `enigmap.progress.v1` conserva gli ID completati; `enigmap.language.v1` conserva la lingua. I Set in memoria vengono serializzati prima della scrittura e ricostruiti alla lettura.

**Perché è qui.** Possiamo ricordare i progressi senza account, database o API di salvataggio.

**Limiti.** PC e telefono hanno memorie indipendenti; la normale sincronizzazione del browser non trasferisce questi salvataggi. Cambiare dominio o porta cambia origine. Cancellare i dati del sito può rimuoverli; in sessioni private la persistenza è limitata. Il browser può negare la scrittura.

Lo spazio è limitato e le operazioni sono sincrone, ma il nostro salvataggio è piccolo. Non salviamo lì immagini o video. Il sito avvisa se la persistenza non riesce e consente comunque di esportare.

Non è cifratura: un codice malevolo già in esecuzione sulla stessa origine potrebbe accedere a quei dati.

Riferimento: [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## 32. Bitset: una spunta diventa un bit

Questa è una struttura di dati implementata da noi, non una dipendenza npm.

Ogni collezionabile ha due stati: incompleto o completo. Bastano quindi 315 bit, più un bit per due lingue. I 316 bit occupano 40 byte, con quattro bit inutilizzati mantenuti a zero.

Il punto cruciale è il manifesto `transfer-v1.json`: l’indice di ogni ID è congelato. Se il primo bit significa il primo trofeo di Bleake, deve continuare a significarlo anche dopo un riordino delle schede.

**Perché è utile.** Nel trasferimento non dobbiamo ripetere 315 stringhe identificative. Il codice è compatto perché rappresenta uno schema piccolo e noto a entrambi i dispositivi.

**Limite.** Non è una compressione universale del JSON. Se aggiungiamo nuove categorie di stato o cambiamo il catalogo, va progettata la compatibilità del formato. Il prefisso `EN1-` identifica la versione del trasferimento, indipendente da `version: "0.1.0"` dell’app.

## 33. Base64url: byte convertiti in testo

È una codifica che rappresenta byte tramite caratteri testuali. La variante URL-safe evita alcuni caratteri problematici per link e percorsi.

**Nel nostro formato.** I 40 byte dei dati e i 4 del checksum diventano 59 caratteri Base64url senza padding. Il prefisso `EN1-` porta il totale a 63.

**Perché serve.** Un blocco binario non è comodo da selezionare o incollare. Una stringa sì. Usiamo API già disponibili nel browser e una piccola trasformazione dell’alfabeto; non abbiamo installato un pacchetto Base64.

La decodifica accetta una rappresentazione canonica, cioè una forma testuale precisa per gli stessi byte, e rifiuta lunghezze o caratteri inattesi.

**Limite.** Base64url non nasconde i dati e aumenta il numero di caratteri rispetto ai byte binari. Il vantaggio di dimensione rispetto al JSON nasce dal bitset precedente, non da una presunta compressione Base64.

Riferimento: [RFC 4648, codifiche Base64 e Base64url](https://www.rfc-editor.org/rfc/rfc4648).

## 34. CRC-32: riconoscere un codice danneggiato

È un checksum: una funzione che ricava un valore di controllo dai dati. Nel progetto usiamo CRC-32/ISO-HDLC, implementato direttamente in `transfer.ts`.

Il valore viene calcolato sul prefisso e sui 40 byte del payload, poi salvato in altri 4 byte. In importazione il calcolo viene ripetuto e confrontato con il valore ricevuto.

**Perché è qui.** Se una parte del codice viene modificata accidentalmente, vogliamo rifiutare il trasferimento prima di cambiare lingua o progressi. Controlliamo anche versione, lunghezza e bit riservati: il checksum non è l’unica validazione.

**Limite essenziale.** Un CRC può avere collisioni e non è una firma. Una persona può costruire un altro salvataggio e calcolarne un CRC valido. Non dimostra chi abbia creato il codice e non impedisce di scegliere intenzionalmente altre spunte.

Per i dettagli esatti e i risultati di riferimento vedere [formato del trasferimento](transfer-code.md). Nessuna libreria di crittografia è necessaria per la funzione richiesta.

## 35. API del browser: copia, file e resize

Non ogni funzione usata richiede un pacchetto.

**Clipboard API.** `navigator.clipboard.writeText` copia il codice. È soggetta al contesto sicuro e ai permessi: la pagina gestisce il rifiuto selezionando il testo per la copia manuale. [Documentazione](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).

**File e Blob.** Il selettore di file permette di leggere un JSON scelto dall’utente. `Blob` e `URL.createObjectURL` costruiscono un file scaricabile per l’esportazione; l’URL temporaneo viene poi revocato. Non c’è un upload del salvataggio a un server.

**ResizeObserver.** Informa il componente quando cambia lo spazio della mappa, così Leaflet può ricalcolarne la visualizzazione.

**Uint8Array e DataView.** Gestiscono byte e lettura/scrittura del checksum nel formato di trasferimento. `Set` elimina duplicati negli ID.

Queste sono API o strutture native della piattaforma. La compatibilità va controllata nei browser di destinazione: TypeScript può descriverle senza renderle disponibili in un browser che non le implementa.

## 36. Traduzioni: un piccolo sistema scritto nel progetto

Non abbiamo installato i18next o un servizio di traduzione.

`LanguageProvider` conserva la lingua e offre `t`, una funzione che restituisce il testo corretto. I contenuti lunghi delle schede inglesi sono in un catalogo separato; i dati geometrici e gli ID restano condivisi. La ricerca contiene alias di entrambe le lingue.

**Perché basta qui.** Le lingue sono due e la struttura è limitata. Tenere il sistema piccolo evita una dipendenza ulteriore e lascia esplicito il comportamento di salvataggio.

La scelta inglese predefinita è una decisione di prodotto: non viene dedotta dalla lingua del browser. In seguito prevale la preferenza salvata. Importare un codice applica anche la lingua ricevuta; importare il JSON applica solo le spunte.

**Limite.** La funzione non è un motore completo per plurali, formattazioni e fallback complessi. Se il progetto cresce a molte lingue, una libreria dedicata può diventare giustificata. Nessuna traduzione avviene tramite AI o API mentre l’utente apre una scheda.

## 37. Python: preparare i dati prima della build

Gli script Python scaricano riferimenti temporanei, generano mappe e cataloghi e ricostruiscono le traduzioni dalle note curate.

**Perché è fuori da package.json.** Non tutto il progetto deve essere scritto nello stesso linguaggio. Questi script usano la libreria standard Python e non fanno parte del codice consegnato al browser.

`build-maps.py` produce SVG e calibrazione; `build-catalog.py` combina dati e note italiane; `build-english.py` produce il catalogo inglese e verifica che il numero dei passaggi corrisponda alla versione italiana. I separatori espliciti ` || ` mantengono la suddivisione voluta delle istruzioni.

I riferimenti scaricati da `research.py` restano in `/tmp/enigmap-research`. `research-extra.py` comprende anche vecchio materiale Catwoman e non serve al funzionamento attuale.

**Limite.** Rigenerare i dati può richiedere riferimenti disponibili e formati editoriali ancora compatibili con gli script. La normale build npm usa invece i JSON/SVG già presenti e non consulta le guide. Generare un marker non ne certifica l’esattezza nel gioco.

## 38. Google Fonts: caratteri esterni

Il CSS importa DM Sans e Space Grotesk dal servizio Google Fonts. Non sono pacchetti npm.

**Perché sono qui.** Contribuiscono all’aspetto dell’interfaccia senza distribuire manualmente i file dei caratteri nel progetto.

**Conseguenza.** Il browser effettua richieste a un servizio esterno. Quindi “nessun backend applicativo” non equivale a “nessuna richiesta verso terze parti”. Se i font non arrivano, vengono usati i fallback dichiarati nel CSS.

Si potrebbe ospitarli localmente, verificando i relativi file di licenza. Non è stato fatto in questa implementazione. Per il racconto pubblico del progetto è più accurato dire “i progressi non vengono caricati su un backend” che promettere genericamente “nessun dato lascia mai il dispositivo”.

## 39. Git, GitHub e .gitignore

Git conserva versioni dei file. GitHub è un possibile servizio che ospita un repository Git: non è il programma che aggiorna l’interfaccia e non è automaticamente l’hosting del sito.

Il `.gitignore` esclude file generati, ambiente locale, log e backup personali futuri. Non rimuove file già tracciati o oggetti presenti nello storico.

Su richiesta, lo storico locale è stato riscritto: sono state rimosse la vecchia UI iniziale e la variante con screenshot della città originale, insieme al ramo/tag di rollback. La versione attuale è su `main`; sono conservate le revisioni successive alla prima versione vettoriale antracite. Gli hash precedenti non identificano più gli stessi commit della cronologia mantenuta.

**Perché conta.** Pubblicare un repository può rendere consultabili anche revisioni precedenti. In questo caso la rimozione ha riguardato pure gli oggetti dello screenshot e del wrapper SVG, non soltanto i file visibili nella cartella attuale.

Non ci sono remoti configurati al momento di questa operazione: non è stato effettuato un push o riscritta una copia esterna.

## 40. Hosting statico e HTTPS

Il risultato di `npm run build` è una cartella di file. Un servizio come Cloudflare Pages può consegnarli via HTTPS senza mantenere un processo Node per ogni visita.

**Perché lo stack è adatto.** Catalogo e mappe sono distribuiti con l’app; progressi e lingua restano nel browser. Per questa funzione non servono query a un database o sessioni di login.

**Configurazione attuale.** Il workflow GitHub Pages installa le dipendenze, esegue i test e pubblica la build `dist/`. Il prefisso viene passato a Vite durante la build; mappe, logo e link iniziale usano `import.meta.env.BASE_URL`, quindi funzionano anche sotto `/enigmap/`. La cartografia deve ancora essere verificata direttamente nel gioco. Non c’è un service worker, quindi non promettiamo un avvio offline affidabile.

Pubblicare il sito non trasferisce il localStorage da localhost: per conservare i progressi serve importare codice o JSON sul nuovo dominio.

Riferimenti e configurazione: [note di deploy](deployment.md), [distribuire un sito Vite](https://vite.dev/guide/static-deploy.html).

## 41. 0BSD: la licenza del codice

È una licenza permissiva che concede uso, copia, modifica e distribuzione del software anche a pagamento, senza una condizione di attribuzione, con esclusione delle garanzie.

**Perché è qui.** L’obiettivo era consentire il riuso del codice con pochissimi obblighi. Il valore `license` nel manifesto indica la scelta; il file `LICENSE` contiene il testo applicabile al software originale del progetto.

**Confini.** Non concede diritti sui marchi di Batman, non cambia le licenze delle dipendenze e non trasforma automaticamente sfondi o asset di terzi in contenuti 0BSD. La natura non ufficiale del progetto resta dichiarata.

Non richiede di togliere `private: true`: quel campo riguarda la distribuzione tramite npm, non la possibilità di pubblicare il codice su GitHub o il sito su un hosting.

Riferimento: [testo 0BSD, Open Source Initiative](https://opensource.org/license/0bsd).

## Come raccontarlo nel blog o su LinkedIn

Ogni capitolo precedente può diventare un approfondimento. Questi sono cinque fili narrativi basati su ciò che è realmente implementato:

1. **Una mappa di un videogioco con Leaflet.** Problema: non abbiamo coordinate terrestri. Scelta: CRS piano, mappe SVG e un adattatore delle coordinate. Limite: il motore non certifica l’esattezza dei dati.
2. **315 spunte e due lingue in 63 caratteri.** Partire dal bitset, spiegare il manifesto stabile, poi checksum e Base64url. Mostrare perché il risultato è trasferimento manuale, non sincronizzazione o cifratura.
3. **Nessun account, ma progressi persistenti.** Mostrare il vantaggio del localStorage e il compromesso: origine, perdita dei dati locali e dispositivi indipendenti.
4. **Perché testare sia funzioni sia browser.** Un formato può fare round trip correttamente mentre un pulsante o il layout mobile è guasto. Collegare Node e Playwright a due problemi diversi.
5. **Capire il package.json senza imparare nomi a memoria.** Seguire una singola modifica: npm avvia Vite, il plugin aggiorna React, TypeScript controlla, la build produce file statici.

Formulazioni da mantenere accurate: “catalogo numericamente completo” non significa “tutto verificato nel gioco”; “senza backend applicativo” non significa “senza hosting”; “checksum” non significa “firma”; “codifica compatta” non significa “dati segreti”.

## Riferimenti interni

- [Indice e manutenzione](README.md)
- [Audit dei contenuti](content-audit.md)
- [Formato del codice](transfer-code.md)
- [Revisione dell’importazione](import-security-review.md)
- [Deploy](deployment.md)
