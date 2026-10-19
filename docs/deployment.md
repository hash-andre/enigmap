# Deployment readiness

The app can be hosted as static files, with no backend, accounts or runtime secrets. Its functional checks pass, but map accuracy has not been verified directly in the game. Treat a first release as a beta; see the [content audit](content-audit.md).

## Build and host

```sh
npm ci
npm test
npm run build
```

Publish `dist/` at the root of an HTTPS origin. Cloudflare Pages is a suitable option: build command `npm run build`, output directory `dist`, repository root as the working directory. The project was checked locally with Node 24; use a compatible Node version in the host's build environment.

The current implementation is on `main`. The initial UI and in-game screenshot variant have been removed from local Git history, along with the old branch/tag used for rollback. Later vector-map revisions were retained with rewritten commit hashes. GitHub Pages deployment is configured in `.github/workflows/static.yml` for pushes to `main` and manual runs. The workflow installs dependencies, runs unit tests, builds with the base path reported by GitHub Pages, and uploads only `dist/`.

Do not serve the Vite development server publicly. `npm run preview` is for checking the build locally, not a production server.

## Hosting paths

Local development and normal builds keep Vite's default `/` base. The Pages workflow sets the build base from `actions/configure-pages`, so a repository site uses `/enigmap/` while a root/custom-domain site can use `/`. Runtime map images, the Batman logo and home navigation use `import.meta.env.BASE_URL`; Vite rewrites bundled assets and HTML asset references.

To reproduce repository Pages locally, run `npm run test:pages`. It builds with `/enigmap/` and uses an isolated static server and browser to check desktop/mobile, English/Italian maps, logo, favicon, backgrounds, the point dialog and home navigation without local asset 404s. Set Pages → Source to **GitHub Actions** in repository settings. Publishing the raw source tree (`path: '.'`) will not run a Vite/TypeScript application.

## Before public release

- Review [known content limitations](content-audit.md); keep the beta status explicit until markers and complex solutions have been checked in game.
- Confirm redistribution rights for the two supplied background images and Batman logo. The project's 0BSD license does not grant rights to third-party assets or dependencies.
- The local history was cleaned before publication: the original city screenshot, its SVG wrapper and the initial UI revisions are no longer retained. This was a history rewrite, not a `.gitignore` change. Review any future additions and their provenance before publishing.
- Confirm that no personal exports, local environment files or credentials are included. `.gitignore` helps with future additions but is not a secrets audit.
- On the final HTTPS URL, check map/logo loading, mobile layout, language persistence, progress, transfer codes and JSON import/export. Export local progress first: localhost and the hosted domain have separate localStorage.

Google Fonts is the only external resource loaded automatically by the app; guide/video links open on request. There is no service worker or guaranteed offline startup. HTTPS supports clipboard access; manual copying remains available if permission is denied.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [Cloudflare Pages with Git](https://vite.dev/guide/static-deploy.html#cloudflare-pages).
