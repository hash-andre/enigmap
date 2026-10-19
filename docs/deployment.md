# Deployment readiness

The app can be hosted as static files, with no backend, accounts or runtime secrets. Its functional checks pass, but map accuracy has not been verified directly in the game. Treat a first release as a beta; see the [content audit](content-audit.md).

## Build and host

```sh
npm ci
npm test
npm run build
```

Publish `dist/` at the root of an HTTPS origin. Cloudflare Pages is a suitable option: build command `npm run build`, output directory `dist`, repository root as the working directory. The project was checked locally with Node 24; use a compatible Node version in the host's build environment.

The current implementation is on `ui/black-game-map`; `main` still contains the original UI. Select the current branch explicitly, or merge it into the intended production branch first. No deployment workflow or online publication has been configured here.

Do not serve the Vite development server publicly. `npm run preview` is for checking the build locally, not a production server.

## Hosting paths

Current assets use root-relative URLs, including `/maps/`, `/batman-logo.svg` and the home link. Hosting at a domain root works with the current Vite base. A GitHub **repository** Pages URL such as `user.github.io/enigmap/` needs both Vite's base configured and runtime asset/home URLs adapted to that base. Changing only the build command is insufficient. GitHub Pages on a root URL or custom domain does not have this subdirectory issue.

## Before public release

- Review [known content limitations](content-audit.md); keep the beta status explicit until markers and complex solutions have been checked in game.
- Confirm redistribution rights for the two supplied background images and Batman logo. The project's 0BSD license does not grant rights to third-party assets or dependencies.
- Review Git history as well as the working tree: a previous commit contains the removed `public/maps/gotham-game.jpg`. `.gitignore` does not remove tracked files or historical assets. History has been preserved for rollback and has not been rewritten.
- Confirm that no personal exports, local environment files or credentials are included. `.gitignore` helps with future additions but is not a secrets audit.
- On the final HTTPS URL, check map/logo loading, mobile layout, language persistence, progress, transfer codes and JSON import/export. Export local progress first: localhost and the hosted domain have separate localStorage.

Google Fonts is the only external resource loaded automatically by the app; guide/video links open on request. There is no service worker or guaranteed offline startup. HTTPS supports clipboard access; manual copying remains available if permission is denied.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [Cloudflare Pages with Git](https://vite.dev/guide/static-deploy.html#cloudflare-pages).
