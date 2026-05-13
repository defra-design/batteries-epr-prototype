# CLAUDE.md

Guidance for Claude Code working on this repository.

## Project overview

`batteries-producer-frontend` is a **prototype** Defra service for battery producers under the Waste Batteries and Accumulators Regulations 2009. **No backend.** All persistence is in the browser via `localStorage`, accessed through a single `storage-adapter.js` module that can later be swapped for a real backend client.

The architectural template is `~/Defra/Waste/waste-organisation-frontend`. Mirror its file layout, naming, and tooling exactly — except for everything that talks to a backend (`backendApi` plugin, real OIDC, Redis, S3). Those are replaced by the storage adapter.

Node.js v22.16.0, ES modules, JavaScript only (no TypeScript). Port 3010.

## Commands

```bash
npm run dev              # webpack watch + nodemon
npm run build:frontend   # webpack build (required before tests)
npm test                 # Vitest with 100% coverage threshold
npm run test:watch       # watch mode
npm run lint             # ESLint + Stylelint
npm run format           # Prettier
```

Tests require `TZ=UTC` (set automatically by npm scripts). Pre-commit hooks run `format:check && lint && test`.

## Architecture

### Server bootstrap

`src/index.js` → `src/server/common/helpers/start-server.js` → `src/server/server.js` (`createServer(plugins)`)

Plugins registered in order: requestLogger (pino), requestTracing, secureContext, pulse, **application plugins** (currently empty), nunjucks/vision, scooter, **router**, sessionCache (yar, in-memory), CSP (blankie).

There is **no real auth**. Routes are open at the Hapi layer; gating happens client-side via `auth-gate.js` (Phase 3).

### Router

Each feature module exports `openRoutes`. The router wraps each in a named Hapi plugin via the `createPlugin` reducer pattern. There are no `addAuth`/`addAuthWithOrg` wrappers — all gating is client-side.

### Feature module pattern

```
feature/
  index.js            # exports { openRoutes }
  controller.js       # named export with handler(s)
  controller.test.js
  index.njk           # or view.njk
```

Controller shape: `export const xController = { handler(request, h) { ... } }`. Routes spread controllers: `{ method: 'GET', path: paths.x, ...xController }`.

### Storage adapter (Phase 2 onwards)

`src/client/javascripts/storage-adapter.js` is the single seam. Every page's client-side script imports this module and nothing else for persistence. When the real backend lands, only this module changes. See PRD §6.2 / §9 for the contract.

### Config

- `src/config/config.js` — convict schema. Sections: `port`, `appBaseUrl`, `serviceName`, `log`, `session` (in-memory cookie for transient flash messages), `nunjucks`, `tracing`.
- `src/config/paths.js` — central URL registry + `pathTo()` helper.
- `src/config/content.js` — page content per `getContentForLanguage(request, { en, cy })`. Welsh stubbed.
- `src/config/nunjucks/` — vision setup, per-request context (`getAssetPath`, `serviceName`, `breadcrumbs`, `navigation`), globals (`govukRebrand: true`), filters (`assign`, `formatDate`, `formatCurrency`).

### Templates

Base layout: `src/server/common/templates/layouts/page.njk` extends `govuk/template.njk`. Views resolved relative to `src/server/`. govuk-frontend v5, Tudor Crown.

## Yar exception

`@hapi/yar` is registered (in-memory cache only, no Redis) so transient form-error flash messages work the same way as in waste-organisation. This is the **only** server-side state — everything else lives in the browser. Documented in the plan's Phase 3.3.

## Postcode → agency map

`src/client/javascripts/postcode-to-agency.js` maps the first 1–2 letters of a UK postcode to a regulator code. Hard-coded regex per Phase-0 question 5:

- `BT` → `NIEA` (Northern Ireland)
- `EH | FK | G | AB | DD | IV | KW | PA | PH | KY | ML | TD | DG` → `SEPA` (Scotland)
- `CF | LL | SA | LD | SY | NP` → `NRW` (Wales)
- everything else → `EA` (England)

Used during onboarding to derive `producer.agencyCode`, which feeds BPRN allocation (`BPRN-{AGENCY}-{YYYY}-{NNNNNN}`). Update the regex if the prototype demos hit a postcode that lands in the wrong regulator.

## Edit-from-account flow

`/account` edit links carry `?return=/account`. Onboarding controllers honour the param via `actionWithReturn` + `isAllowedReturn` (in `src/server/onboarding/shared.js`) so the form action and POST `nextStep` route back to `/account` instead of advancing to the next wizard step. The allow-list regex `^/[A-Za-z0-9/_-]*$` blocks open-redirect attempts.

## Dev reset

`/dev/reset` is gated server-side on `!config.isProduction`, returning 404 in production. The same gate hides the reset button on `/account`. Both call `storage.resetAllData()` + `storage.seedDemoData()` and redirect to `/`.

## Coding style

- **No comments** — favour well-named identifiers
- **No TypeScript `any` casts** (project rule)
- No semicolons, single quotes, no trailing commas, 2-space indent (Prettier)
- ESLint: neostandard preset, max line 160
- Unused params: prefix `_`
- Node built-ins: `node:` prefix
- Always include `.js` in import paths

## Testing

100% coverage required (Vitest threshold).

```js
import { initialiseServer } from '~/src/test-utils/initialise-server.js'

let server
beforeAll(async () => {
  server = await initialiseServer()
})
afterAll(async () => {
  await server.stop({ timeout: 0 })
})
```

`initialiseServer({ mockedPlugins })` dynamically imports the server and merges plugin overrides. The OIDC mock and session helpers from waste-organisation are dropped.

## Out of scope (this prototype)

- Backend service of any kind (no Hapi API, no MongoDB, no SQS, no S3)
- Real Defra ID, GOV.UK Pay, GOV.UK Notify
- Spreadsheet upload (PRD §12)
- Agency / scheme / reprocessor / ABTO / ABE / evidence-note workflows
- NPWD data migration
- Welsh content beyond stub keys
