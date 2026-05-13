# batteries-producer-frontend

> **This is a prototype.** No backend. All persistence lives in the browser via `localStorage`. Refresh the page in a different browser or incognito session and you start over. This service is for validating user journeys, copy, and the data model on screen — not for handling real producer data.

A GDS-pattern Hapi.js + Nunjucks frontend that reproduces the producer-facing journeys from legacy NPWD for the Waste Batteries and Accumulators Regulations 2009.

## Requirements

- Node.js v22.16.0 (use `.nvmrc`)
- npm

## Getting started

```bash
npm install
npm run dev
```

The service runs on http://localhost:3010.

## Useful URLs in development

- `/` — landing page
- `/sign-in` — mock sign-in (any valid email)
- `/dashboard` — producer dashboard (auth-gated client-side)
- `/account` — manage account: edit details, view past submissions, reset prototype data
- `/register/search` — public register, no auth required
- `/dev/reset` — wipe all browser state and reseed demo data

`/dev/reset` is gated on `!config.isProduction` and 404s when running with `NODE_ENV=production`.

## Demo seed

On first load, the storage adapter seeds 20 fake producers across the four UK environment regulators (EA, NRW, SEPA, NIEA), in mixed states (Approved / Submitted / Started). Use them to drive the public register search, or sign in with a fresh email to walk the onboarding journey from scratch.

## Storage seam

Everything that would otherwise be a backend call goes through `src/client/javascripts/storage-adapter.js`. When the real backend lands, that single module is the only thing that needs to change — the public register, dashboard, onboarding wizard, annual return, and account pages all consume the same API surface.

## Commands

```bash
npm run dev              # webpack watch + nodemon (port 3010)
npm run build:frontend   # webpack production build
npm test                 # Vitest, 100% coverage threshold
npm run test:watch       # Vitest in watch mode
npm run lint             # ESLint + Stylelint
npm run format           # Prettier write
npm run format:check     # Prettier check (CI mode)
```

Pre-commit hooks run `format:check && lint && test`.

## Docker

```bash
docker build --target production -t batteries-producer-frontend .
docker run --rm -p 3010:3010 batteries-producer-frontend
```

## Out of scope

- Backend service of any kind
- Real Defra ID OIDC, GOV.UK Pay, GOV.UK Notify
- Spreadsheet upload
- Agency / scheme / reprocessor / ABTO / ABE / evidence-note workflows
- NPWD data migration
- Welsh content beyond stub keys
- Cross-browser / multi-user data sharing (localStorage is per-browser-per-origin by design)

## Documentation

- `CLAUDE.md` — architectural notes for working on this repo
- `docs/` (in the parent NPWD project) — product requirements and rationale
