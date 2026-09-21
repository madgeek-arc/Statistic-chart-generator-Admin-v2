# Statistic Chart Generator Admin V2

A single-page Angular app for building charts and tables from OpenAIRE statistics data. You pick a data view, a chart type, describe the data (entities, aggregates, filters) and style the result. Charts are rendered by the statistics service and can be shared through a short URL. An "Ask agent" mode builds the same configuration from a natural-language request. The UI is branded Dataloom.

## Stack

- Angular 21 with standalone components (no NgModules) and zone.js change detection
- TypeScript, LESS, UIkit and Angular Material
- Chart options for HighCharts, Google Charts, ECharts and Highmaps
- Karma + Jasmine for tests, ESLint (angular-eslint) for linting

## Getting started

Requires Node.js 20.19+ or 22.12+ (`.nvmrc` pins 22).

```bash
npm install
npm start        # http://localhost:4200
```

The API base URL comes from `src/environments/` (`apiUrl` + `apiFolder`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests in Chrome (watch mode) |
| `npm run lint` | ESLint over `src/**/*.ts` and templates |
| `npm run analyze:stats` | Build and open a bundle analyzer |
| `npm run analyze:source-maps` | Build and open a source-map explorer |

For a single headless test run:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

If Chrome isn't installed, point `CHROME_BIN` at the Chromium that the `puppeteer` dev dependency downloads. CI does the same.

## Project layout

- `src/app/dashboard/` – the main wizard (view, chart type, data, appearance), its selectors and the per-library option panels
- `src/app/data-frames/` – embeds rendered charts and tables, and the short-URL field
- `src/app/nl-chat/` – the natural-language "Ask agent" chat
- `src/app/services/` – API access, form state, and chart/URL building
- `src/app/shared/` – shared form input component
- `src/app/header/`, `footer/`, `page-not-found/` – app shell

## CI

`.github/workflows/ci.yml` runs lint, the unit tests and a production build.

## Conventions

Coding conventions for this project are in [`CLAUDE.md`](./CLAUDE.md).
