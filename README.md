# Enigmap

An interactive map for all 315 Riddler collectibles in **Batman: Arkham Knight**, with step-by-step solutions in English and Italian.

Choose a marker, follow the solution, and mark it completed. No account or backend.

Progress and language preferences stay in your browser’s `localStorage`; there is no automatic sync between devices.

To transfer progress, open **⋯ → Transfer with code**, copy the 63-character code, and import it on the other device. Importing merges completions and applies the saved language. Codes include an error-detection checksum; they are not encrypted. JSON export/import remains available.

Built with React, TypeScript, Vite, and Leaflet.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Build with `npm run build`.

[0BSD license](LICENSE). Third-party assets and trademarks remain subject to their owners’ rights. Unofficial fan project.
