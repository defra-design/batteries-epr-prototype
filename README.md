# batteries-epr-prototype

> **This is a prototype.** No backend. All persistence lives in the browser via `localStorage`. Refresh the page in a different browser or incognito session and you start over. This service is for validating user journeys, copy, and the data model on screen — not for handling real producer data.

A GDS-pattern Hapi.js + Nunjucks frontend that reproduces the producer-facing journeys from legacy NPWD for the Waste Batteries and Accumulators Regulations 2009.

## Requirements

- Node.js v22.16.0 (use `.nvmrc`)
- pnpm 11

## Getting started

```bash
corepack enable
corepack prepare pnpm@11 --activate
pnpm install
pnpm dev
```

The service runs on http://localhost:3010.

CI installs dependencies with `pnpm install --frozen-lockfile`, so commit
`pnpm-lock.yaml` whenever dependencies change. If pnpm reports ignored build
scripts after dependency changes, run `pnpm approve-builds` locally and commit
the resulting approval changes.

## Useful URLs in development

### Producer journey

- `/` — landing page
- `/sign-in` — mock sign-in (any valid email)
- `/dashboard` — producer dashboard (auth-gated client-side)
- `/account` — manage account: edit details, view past submissions, reset prototype data
- `/account/scheme` — scheme-represented producers see their scheme detail + membership timeline + change/leave actions
- `/onboarding/producer-route` — fork between Small producer, Direct registrant, and Compliance scheme member
- `/onboarding/scheme-select` — pick an approved scheme (client-side filtered to the producer's environment agency)
- `/onboarding/scheme-confirm` — read-only confirmation of the selected scheme
- `/leave-scheme/reason` → `/leave-scheme/declaration` → `/leave-scheme/confirmation` — three-step wizard for a scheme member to leave and become a direct registrant
- `/annual-return/{registrationId}/scheme-represented` — informational page shown when a scheme-represented producer hits an annual-return URL; their scheme files on their behalf
- `/register/search`, `/register/{bprn}` — public register, no auth required

### Compliance-scheme operator side

- `/compliance-scheme` — scheme dashboard
- `/compliance-scheme/application/{step}` — approval application wizard
- `/compliance-scheme/members` — member list with **Awaiting your acceptance** queue for self-onboarding producers, plus accept / reject actions that allocate a BPRN and flip the producer's registration to `Submitted`
- `/compliance-scheme/members/add`, `/compliance-scheme/members/{memberId}/remove`
- `/compliance-scheme/quarterly/{quarter}/{step}`, `/compliance-scheme/industrial-automotive/{step}`
- `/compliance-scheme/evidence`, `/compliance-scheme/evidence/issue/{step}`, `/compliance-scheme/evidence/{evidenceId}`, `/compliance-scheme/evidence/{evidenceId}/transfer`, `/compliance-scheme/evidence/availability`
- `/compliance-scheme/obligation` — obligation breakdown for the scheme's members

### Dev tools

- `/dev/reset` — wipe all browser state and reseed demo data
- `/dev/time-travel` — set the current compliance period
- `/dev/schemes` — JSON dump of seeded schemes

`/dev/reset` is gated on `!config.isProduction` and 404s when running with `NODE_ENV=production`.

## Demo seed

On first load, the storage adapter seeds 20 fake producers across the four UK environment regulators (EA, NRW, SEPA, NIEA), in mixed states (Approved / Submitted / Started). Use them to drive the public register search, or sign in with a fresh email to walk the onboarding journey from scratch.

## Compliance scheme membership

A producer can register as a **member of a battery compliance scheme** rather than directly with their environment agency. This slice lives in the producer service (rather than waiting for a dedicated `batteries-scheme-frontend`) because the producer-side surface is the same shape as Small / Direct: it's an onboarding fork plus a few dashboard and account tiles. See `docs/decisions/0001-scheme-membership-stays-in-producer-frontend-until-bcs-service-lands.md`.

The flow:

1. **Onboarding** — producer picks "Member of a battery compliance scheme", chooses an approved scheme (filtered to their agency), confirms. Registration is created with `producerRoute: 'complianceScheme'`, `status: 'pendingScheme'`, `bprn: null`. A `schemeMember` row is created with `status: 'pendingAcceptance'`.
2. **Acceptance** — scheme operator opens `/compliance-scheme/members`, sees the producer under **Awaiting your acceptance**, clicks Accept. `acceptSchemeMember` allocates a BPRN against the producer's agency, marks the producer `Approved`, flips the registration to `Submitted`, and the membership to `active`.
3. **Dashboard / account** — accepted scheme members see a "Your compliance scheme" tile on the dashboard (replacing Annual return), Service charge is hidden, and `/account/scheme` shows scheme details + membership timeline.
4. **Annual return gate** — any hit to `/annual-return/*` for a scheme-route registration client-side redirects to `/annual-return/{registrationId}/scheme-represented` ("your scheme reports on your behalf").
5. **Leaving** — `/leave-scheme/reason → declaration → confirmation` closes the membership, supersedes the old registration, and creates a fresh `directRegistrant` registration (reusing the producer's existing BPRN where possible).

Data model lives in `src/client/javascripts/storage-adapter.js`:

- `schemes` — approved schemes seeded with `agencyCode`, `compliancePeriod`, `operator`, `contactEmail`, `webAddress`.
- `schemeMembers` — `{ schemeId, producerBprn, producerEmail, compliancePeriod, status, joinedOn, acceptedOn, leftOn, reasonForLeaving, replacedById }`.
- Adapter functions: `getSchemes`, `getSchemeById`, `getActiveSchemeMembership`, `getSchemeMembershipHistory`, `listPendingSchemeMembers`, `joinScheme`, `acceptSchemeMember`, `rejectSchemeMember`, `leaveScheme`, `transitionToDirect`.

## Storage seam

Everything that would otherwise be a backend call goes through `src/client/javascripts/storage-adapter.js`. When the real backend lands, that single module is the only thing that needs to change — the public register, dashboard, onboarding wizard, annual return, and account pages all consume the same API surface.

## Commands

```bash
pnpm dev              # webpack watch + nodemon (port 3010)
pnpm build:frontend   # webpack production build
pnpm test             # Vitest, 100% coverage threshold
pnpm test:watch       # Vitest in watch mode
pnpm lint             # ESLint + Stylelint
pnpm format           # Prettier write
pnpm format:check     # Prettier check (CI mode)
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
