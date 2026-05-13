# Compliance Scheme — Phased Implementation Plan

**Target service**: `batteries-producer-frontend` (this repo).
**Status**: planning. No code yet.
**Author context**: extends the producer flow already shipped (`smallProducer` + `directRegistrant`) with a third route — **producers represented by a Battery Compliance Scheme (BCS)**. Modernises the journeys in NPWD's `Public/Batteries/ProducerPreregistration/` (when a member joins via a scheme) and `Public/Batteries/SchemeMemberToDirectRegistrant/` (when a member leaves one).

Scope is deliberately limited to **the producer's view of scheme membership** in this prototype. The scheme-operator UI (member-roster upload, `SchemeApproval`, scheme-side annual obligation) is explicitly out of scope and remains deferred to `batteries-scheme-frontend` per `BATTERIES-NEW-SERVICE-PRD.md` §16.

---

## 0. Why a producer-only slice first

The legacy NPWD model (see `BATTERIES-ANALYSIS.md` §4.1) makes a producer's `ProducerRegistration` row carry a nullable `SchemeOrgId`. Whether a producer is direct or scheme-represented is a single column flip — the producer's identity, brand names, addresses, and annual return data are **already captured** by the existing onboarding wizard. What changes for a scheme-represented producer is:

- A scheme is selected at registration time and shown back on every dashboard / account view.
- The annual-return obligation is **borne by the scheme**, so the producer's `annualReturn` page becomes informational, not data-entry.
- The producer can transition out (leave the scheme) and back to direct-registrant status mid-period.
- The fee schedule differs (scheme fees are paid by the scheme; producer pays only a member fee or none — confirm via Phase 0 question 3).

Building this in the producer frontend gives a complete demonstrable journey end-to-end without the scheme-operator service existing yet. The scheme list is seeded as a fixed JSON fixture; once `batteries-scheme-backend` lands, the storage adapter swap (PRD §16 Phase 1b) replaces the fixture with a live lookup.

---

## 1. Phase 0 — Decisions to lock before scaffolding

These are written down so the prototype is internally consistent. Each has a reasonable default; flag any the human disagrees with before starting Phase 1.

| # | Decision | Default for prototype |
|---|---|---|
| 1 | Scheme picker UX — typeahead vs radio list? | Radio list. The seed fixture has ~6 schemes, fits on one page. Switch to typeahead in Phase 5 if seed grows past 20. |
| 2 | Can a producer be a member of more than one scheme simultaneously? | No. NPWD enforces one `SchemeOrgId` per `ProducerRegistration`. Match that. |
| 3 | Does a scheme-represented producer pay a service charge? | No — fee waived. Skip the existing `serviceCharge` / `paymentDetails` features for this route. Show "Your scheme pays your registration fee" panel instead. |
| 4 | When a producer leaves a scheme mid-period, what is the resulting state? | New `pendingDirect` registration in the same period that supersedes the old one (NPWD's `ReplacedById` chain). Old registration kept for audit — not deleted. |
| 5 | Whose contact details are authoritative for service-of-notice on a scheme-represented producer? | The producer's own — schemes-represent-tonnage, regulators-notify-producer. Re-use the existing `serviceOfNotice` step. |
| 6 | Welsh content | Stub keys only, English copy verbatim, same as every other feature. |
| 7 | Public register — show scheme-represented producers? | Yes. Add a "Represented by" column. Direct registrants show "—". |
| 8 | "Approval status" surface to producer? | Yes/No flag only. Don't expose `EvidenceAvailableStatusId` — that's a regulator concern. |

If any of these flip, the relevant phase below changes scope but not order.

---

## 2. Phase 1 — Data model & storage adapter

**Goal**: extend `storage-adapter.js` to represent schemes and scheme membership, without touching any existing producer/registration code paths.

### 2.1 New entities

Add to `src/client/javascripts/storage-adapter.js`:

```js
export const createScheme = (input = {}) => ({
  id: input.id ?? newId(),
  approvalNo: input.approvalNo ?? null,
  name: input.name ?? null,
  operator: input.operator ?? null,
  agencyCode: input.agencyCode ?? null,
  approvalStatus: input.approvalStatus ?? 'Approved',
  compliancePeriod: input.compliancePeriod ?? null,
  contactEmail: input.contactEmail ?? null,
  webAddress: input.webAddress ?? null,
  ...stamp(input, true)
})

export const createSchemeMembership = (input = {}) => ({
  id: input.id ?? newId(),
  producerId: input.producerId,
  schemeId: input.schemeId,
  compliancePeriod: input.compliancePeriod,
  joinedOn: input.joinedOn ?? now(),
  leftOn: input.leftOn ?? null,
  reasonForLeaving: input.reasonForLeaving ?? null,
  replacedById: input.replacedById ?? null,
  ...stamp(input, true)
})
```

Constants:

- New `STORAGE_KEYS.schemes` and `STORAGE_KEYS.schemeMemberships`.
- New `producerRoute` enum value: `'complianceScheme'`. The Joi validator in `producerRoute/controller.js:18-22` is the only schema source — adding the value there flows everywhere through `storage-seed.json`.

### 2.2 New adapter functions

Single-responsibility, pure of network calls. Add tests for every one.

| Function | Purpose |
|---|---|
| `getSchemes({ agencyCode, compliancePeriod, status = 'Approved' })` | Filtered list for the picker. |
| `getSchemeById(id)` | Detail panel + dashboard render. |
| `getActiveSchemeMembership(producerId, compliancePeriod)` | Returns the current membership (null = direct). |
| `getSchemeMembershipHistory(producerId)` | All memberships, newest first. Used by the audit/timeline panel and the account page. |
| `joinScheme({ producerId, schemeId, compliancePeriod })` | Creates membership, sets producer's current registration `producerRoute = complianceScheme` and `schemeId`. Idempotent on `(producerId, compliancePeriod)`. |
| `leaveScheme({ producerId, compliancePeriod, reasonForLeaving })` | Closes membership (sets `leftOn`), creates a new `pendingDirect` registration with `ReplacedById` pointing at the old one. Does NOT immediately flip the producer to direct — the leave-flow's confirmation step does that. |

### 2.3 Seed data

`src/client/javascripts/storage-seed.json` adds:

- 6 schemes covering all four agencies (EA, NIEA, SEPA, NRW). Mix of statuses: 5 `Approved`, 1 `Pending` (excluded by default filter).
- 1 demo producer pre-joined to a scheme so dashboard demos work without going through onboarding.
- 1 demo producer with a *closed* membership (left mid-period) so the audit timeline has something to render.

`storage.seedDemoData()` and `/dev/reset` automatically include the new entities; bump `seedVersion`.

### 2.4 Tests

- `storage-adapter.test.js` extended for each new function. 100% branch coverage.
- Snapshot test on `storage-seed.json` shape (catches accidental seed regressions).

**Exit criteria**: `npm test` green, no UI changes yet, existing tests untouched.

---

## 3. Phase 2 — Producer route extension (registration)

**Goal**: a new producer can pick "compliance scheme" during onboarding, choose a scheme, and complete registration with an appropriately reduced data set.

### 3.1 Wizard fork

`src/server/onboarding/producerRoute/` already gates on `smallProducer | directRegistrant`. Add `complianceScheme` and a fork.

Decision tree after `producerRoute`:

```
producerRoute === 'smallProducer'      → batteryTypes  → brandNames → declaration → confirmation
producerRoute === 'directRegistrant'   → batteryTypes  → brandNames → declaration → confirmation
producerRoute === 'complianceScheme'   → schemeSelect  → schemeConfirm → declaration → confirmation
```

Rationale:
- `batteryTypes` and `brandNames` are submitted by the scheme on the producer's behalf via the (out-of-scope) BCS member roster spreadsheet. Capturing them here would duplicate and de-sync.
- `declaration` text changes (see 3.3).
- `confirmation` text changes (see 3.4).

### 3.2 New steps

New folders following the existing pattern (`controller.js`, `controller.test.js`, `view.njk`, `index.js`):

- `src/server/onboarding/schemeSelect/` — radio list of approved schemes, filtered by the producer's `agencyCode` (derived in `companyDetails` from postcode → agency, same as today). "I cannot find my scheme" link reveals a contact-your-scheme info panel — does NOT fall back to direct.
- `src/server/onboarding/schemeConfirm/` — read-only summary of the selected scheme (operator, contact, web). "Confirm my scheme" CTA.

Joi schema for `schemeSelect`:

```js
joi.object({
  schemeId: joi.string().uuid().required()
}).options({ stripUnknown: true })
```

Validation: error key `schemes.error.choice`. Render error summary same way as `producerRoute`.

### 3.3 Declaration copy fork

`src/config/content.js` gains a third `onboardingDeclaration` variant. Re-use the wording NPWD applies on `Public/Batteries/SchemeMemberToDirectRegistrant/Declaration.aspx` adapted forward — emphasises that the producer authorises the scheme to act on their behalf and accepts joint and several liability where applicable. Confirm copy with content designer (Phase 0 question — defer).

### 3.4 Confirmation page

Different from direct route:

- No BPRN allocation. The scheme will issue a reference once the next member roster is loaded.
- Instead of "Your BPRN is …", show "We've passed your details to {scheme name}. Your registration will be confirmed when the scheme files its next member roster."
- Skip the service-charge CTA. Show the dashboard CTA only.

`storage.allocateBprn` is **not called** for this route. The producer's registration is created with `bprn: null, status: 'pendingScheme'`.

### 3.5 Edit-from-account interaction

The `actionWithReturn` / `isAllowedReturn` mechanism documented in `CLAUDE.md` already handles `?return=/account` correctly. Apply it to `schemeSelect` and `schemeConfirm` too. Smoke-test that editing the scheme from `/account` jumps the user back without advancing through `declaration` again.

### 3.6 Tests

- `controller.test.js` for both new steps — handler 200, schema rejects, flash on error, `?return` honoured.
- An end-to-end-ish test in `src/server/onboarding/onboarding.test.js` (new file) walking the full `complianceScheme` path with `server.inject()` and asserting the resulting `localStorage` mutations via the adapter directly.

**Exit criteria**: a brand-new browser session can complete `/onboarding/company-details` → … → `/onboarding/confirmation` choosing the compliance-scheme route. Existing `smallProducer` and `directRegistrant` paths unchanged.

---

## 4. Phase 3 — Dashboard + account surfaces

**Goal**: a returning producer sees their scheme membership clearly and can drill into a scheme detail panel.

### 4.1 Dashboard

`src/server/dashboard/index.njk` adds a "Your compliance route" panel:

- If `producerRoute === 'complianceScheme'`: show the scheme name, operator, scheme `approvalNo`, and a "View scheme" link (to `/account/scheme`). Tile copy: "{scheme} files your annual return on your behalf — there is nothing for you to submit this period."
- Otherwise unchanged.

The `annualReturn` tile is hidden for scheme-represented producers and replaced by a "Last roster update — {date}" stub (date pulled from a seed field).

### 4.2 Account page

`src/server/account/view.njk` adds a "Compliance scheme" row (existing pattern: label + value + edit link). Edit link routes to `/onboarding/scheme-select?return=/account` (re-uses the wizard step).

A new feature `src/server/account/scheme/` renders a read-only scheme detail page (`/account/scheme`) showing scheme contact details and a membership timeline (joined / left dates from `getSchemeMembershipHistory`). Pure read-only — no POST.

### 4.3 Tests

- Dashboard test: scheme-represented producer hides the annual-return tile, shows the scheme tile.
- Account test: edit link routes correctly, return param round-trips.
- New `account/scheme/controller.test.js` for the detail page.

**Exit criteria**: refresh `/dashboard` and `/account` against the seeded scheme-represented demo producer and see correct UI.

---

## 5. Phase 4 — Annual return divergence

**Goal**: a scheme-represented producer should never reach the data-entry annual-return forms. Replace them with an informational page.

### 5.1 Route gate

The existing `annualReturn` paths (`/annual-return/{registrationId}/{step}`) currently dispatch on `submissionType`. Add a third branch in `src/server/annualReturn/index.js`:

- If the registration's `producerRoute === 'complianceScheme'`, all `annualReturn/*` URLs render a single "no action required" view via a new `schemeRepresented` controller. POSTs return 405.

### 5.2 New view

`src/server/annualReturn/schemeRepresented/`:

- Heading: "Your scheme reports on your behalf".
- Body: name of the scheme, the compliance period in question, and (if the scheme has filed its roster for that period) the date the roster was received.
- CTA: "Back to dashboard".

No tonnage capture, no declaration. The submission type `complianceSchemeAggregate` exists only as a placeholder in `storage-adapter.js` for future migration; nothing writes to it from this frontend.

### 5.3 Tests

- Route gate test: every `annualReturn/*` GET for a scheme-represented producer returns the new view.
- POSTs return 405.
- Existing `smallProducer` and `ia` paths still pass.

**Exit criteria**: time-traveling (`/dev/time-travel`) to a future compliance period for the seeded scheme-represented demo producer renders the informational view instead of any data-entry form.

---

## 6. Phase 5 — Public register

**Goal**: scheme membership shows up on `/register/search` and `/register/{bprn}`.

### 6.1 Search results

Add a "Represented by" column. Direct registrants render "—". Scheme-represented producers render the scheme name as plain text (no link in this phase — the scheme has no public detail page yet, that lands with `batteries-scheme-frontend`).

### 6.2 Detail page

`/register/{bprn}` adds a "Compliance scheme" section when applicable: name, operator, scheme `approvalNo`. No contact details — that's regulator-only.

### 6.3 BPRN edge case

Scheme-represented producers in the `pendingScheme` state have `bprn: null` and so are NOT routable via `/register/{bprn}`. Filter them out of search until a BPRN is issued. Add a test asserting a 404 for a `pendingScheme` BPRN.

### 6.4 Tests

- Search test: filters by scheme name keyword (existing free-text search) returns scheme-represented producers.
- Detail test: scheme block rendered for scheme-represented, absent for direct.
- 404 test for `pendingScheme`.

**Exit criteria**: from a fresh session, search the public register, find a seeded scheme-represented producer, view their detail page.

---

## 7. Phase 6 — Leaving a scheme (member → direct registrant)

**Goal**: modernise NPWD's `Public/Batteries/SchemeMemberToDirectRegistrant/` flow as a logged-in member self-service.

### 7.1 Trigger

Account page gains a "Leave this scheme" link below the scheme detail row. Behind a feature flag in `src/config/config.js` (`features.allowSchemeLeave`, default `true` in dev / `false` in prod-like) — historically NPWD made this an agency-mediated process; demoing it self-service is fine for prototype, regulatory wording will need legal review later.

### 7.2 Wizard

`src/server/leaveScheme/`:

1. `/leave-scheme/reason` — radio list of `reasonForLeaving` codes (re-use NPWD's `ReasonForLeavingCode` enum: `joinedAnotherScheme`, `belowThreshold`, `ceasedTrading`, `other`). Free-text `otherReason` for `other`.
2. `/leave-scheme/declaration` — declaration that the producer is now responsible for their own compliance.
3. `/leave-scheme/confirmation` — "You are now a direct registrant. Your new BPRN is …".

### 7.3 Storage transitions

Single transaction (in adapter terms) on POST of step 2:

- `leaveScheme(...)` closes the membership.
- A new `producerRegistration` row is created with `producerRoute = 'directRegistrant'`, `bprn = null`, `replacesId = oldRegistrationId`.
- `storage.allocateBprn(...)` runs immediately, populating the new BPRN. NPWD reuses the producer's previous number where possible — match that behaviour: if the producer ever held a BPRN directly in this period, prefer it; otherwise allocate fresh. Add a unit test for both branches.
- The old registration is marked `superseded`.

### 7.4 Re-entry guard

If the producer's current registration is already direct (`producerRoute !== 'complianceScheme'`), all `/leave-scheme/*` routes 404. Easy to forget; cover with a test.

### 7.5 Tests

- Each step's controller (handler, validation, flash).
- Storage transition tests: BPRN reuse vs fresh; supersession links correct; membership `leftOn` set.
- 404 test for the re-entry guard.

**Exit criteria**: a seeded scheme-represented producer can sign in (mocked), pick "Leave this scheme", complete three steps, and land back on `/dashboard` as a fully-fledged direct registrant with a BPRN.

---

## 8. Phase 7 — Cross-cutting polish

Hold these until phases 1–6 are working, otherwise rework risk.

### 8.1 Dev tooling

- `/dev/reset` reseeds schemes too (already covered in Phase 1.3).
- `/dev/time-travel` should respect scheme-represented producers — they still time-travel, just into the informational annual-return view.
- A new `/dev/schemes` JSON dump for debugging (production-gated to 404 like `/dev/reset`).

### 8.2 Postcode → agency interaction

`schemeSelect` filters by `producer.agencyCode`. If a producer has updated their address (and therefore `agencyCode`) since joining a scheme that no longer matches their new agency, NPWD treats this as an agency-driven exception. For the prototype, surface a yellow warning notification on dashboard ("Your scheme is regulated by {oldAgency} but your registered address is now in {newAgency} — contact your scheme") rather than blocking. One template, one test.

### 8.3 Content / accessibility sweep

- Each new page asserts: single `<h1>`, alt text on any imagery, no nested `<a>`s. Same bar as the rest of the service.
- Welsh stubs added for every new content key (English copy verbatim).
- Run `axe-core` against the new pages in dev to catch obvious WCAG 2.2 AA misses (aria-current, focus management on radio reveal, error summary order).

### 8.4 Visual / template tidy

- Add a govuk-tag for scheme approval status (`Approved` → blue, `Pending` → grey).
- "Compliance scheme" appears consistently as the public label everywhere — never "BCS", never "scheme operator".

---

## 9. Phase 8 — Documentation

Update repo docs so a stranger can pick this up:

- `CLAUDE.md` "Architecture" section — add the new feature folders and the route fork.
- `README.md` "Pages" table — add `/account/scheme`, `/leave-scheme/*`.
- This file (`COMPLIANCE-SCHEME-PLAN.md`) — mark phases as `Done` as they ship; do not delete it. It is the contract the eventual `batteries-scheme-frontend` will be built against.

Add a short ADR-style note under `/docs/decisions/0001-scheme-membership-stays-in-producer-frontend-until-bcs-service-lands.md` recording why this slice exists in the producer service rather than waiting for the dedicated scheme service.

---

## 10. Out of scope (do not build in this repo)

| Item | Where it should live |
|---|---|
| BCS member-roster spreadsheet upload (NPWD `BatteriesSchemeReg.vb`) | `batteries-scheme-frontend` (PRD §16 Phase 2) |
| `SchemeApproval` application form | `batteries-scheme-frontend` |
| Scheme-side annual obligation submission | `batteries-scheme-backend` |
| Regulator approval/withdrawal of schemes | `batteries-agency-frontend` (PRD §16 Phase 4) |
| Public scheme detail page | `batteries-scheme-frontend` |
| `BatteriesSchemePublicRegister.rdl` equivalent | `batteries-scheme-frontend` |
| Scheme-to-scheme transfers (a producer moving between schemes mid-period without dropping to direct) | Phase 5/migration — needs roster reconciliation logic that only makes sense once the scheme service exists |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Adding a third producer route bloats the wizard. | The fork is a single switch in `producerRoute/index.js`. Each branch's steps are independently tested. Refactor to a state-machine config only if a fourth route lands (no current candidate). |
| Storage seed grows large enough to slow `/dev/reset`. | Schemes are 6 small objects + a few memberships — negligible. Re-evaluate at >100 entities. |
| The scheme list will eventually move to a backend; users may bookmark IDs. | The `schemeId` is a UUID. Same UUIDs travel forward when the backend lands (PRD Phase 1b). No stable URL is exposed — the picker uses POST-redirect-GET. |
| Copy for the declaration is regulatory and prototype-grade copy will mislead a real reviewer. | Phase 8 ADR explicitly flags declaration copy as "non-binding prototype text — confirm with policy before live". |
| Scheme-represented producers showing in public register before their BPRN is issued. | Phase 5.3 filters `pendingScheme` out of search and 404s the detail page until a BPRN exists. |

---

## 12. Suggested ordering / parallelism

Phases 1 → 2 → 3 are strictly sequential (model first, registration next, dashboards on top). Phases 4, 5, and 6 can run in parallel once Phase 3 is on `main`. Phase 7 is polish — pull tasks from it as you finish each parallel branch. Phase 8 is the final commit before declaring the slice done.

A reasonable cadence: Phase 1 ~½ day, Phase 2 ~1½ days, Phase 3 ~½ day, Phases 4/5/6 ~1 day each, Phase 7 ~½ day, Phase 8 ~half-hour. Total ≈5 working days for one engineer. Add a buffer day for content review on the declaration copy.
