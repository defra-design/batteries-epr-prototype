# Compliance-scheme membership — implementation plan

> **Status**: All phases shipped (2026-05-21). Do not delete this file. It is the contract that the eventual `batteries-scheme-frontend` and `batteries-scheme-backend` will be built against. Producer-side surface stays even after the scheme services land; the operator-side stub here moves out. See [ADR 0001](decisions/0001-scheme-membership-stays-in-producer-frontend-until-bcs-service-lands.md).

## Phases

### Phase 1 — Data model & storage adapter ✅ Done

`Scheme` and `SchemeMembership` entities in `storage-adapter.js`. Adapter functions for filtering schemes, finding/joining/leaving memberships. `producerRoute` Joi validator gains `'complianceScheme'`. Seed data extended to 6 schemes across all four UK agencies.

### Phase 2 — Producer route extension (registration) ✅ Done

- `producerRoute` view gains a third radio option.
- New `schemeSelect` step (radio list of approved schemes, agency-filtered client-side).
- New `schemeConfirm` step (read-only summary of the chosen scheme).
- Declaration content forks via `?route=complianceScheme` — joint-and-several-liability wording.
- Confirmation page suppresses BPRN allocation; shows "We have passed your details to {scheme}".
- `submitRegistration` for a scheme-route producer skips `allocateBprn`, sets registration `status: 'pendingScheme'`, and calls `joinScheme` with `status: 'pendingAcceptance'`.

### Phase 3 — Dashboard + account surfaces ✅ Done

- Dashboard: a "Your compliance scheme" card replaces the Annual return slot for scheme producers; Service charge is hidden; the Activity card widens to full width.
- Registration card shows "Awaiting scheme" status until BPRN allocation.
- `/account` gains a "Compliance scheme" section with the scheme name and a "View scheme details" link.
- New `/account/scheme` page: scheme contact details, approval number, full membership timeline, **Change scheme** and **Leave this scheme** links.

### Phase 4 — Annual return divergence ✅ Done

- Client-side gate in every `/annual-return/*` step: if the registration is on the scheme route, redirect to `/annual-return/{registrationId}/scheme-represented`.
- New server route `/annual-return/{registrationId}/scheme-represented` renders an informational page: scheme name, compliance period, last roster update, "Back to dashboard" CTA. POST returns 405.

### Phase 4.5 — Scheme acceptance ✅ Done

A small phase inserted between 4 and 5 to close the producer-side loop end-to-end:

- `schemeMember` gains `status` (`'active' | 'pendingAcceptance' | 'rejected'`), `acceptedOn`, `producerEmail`.
- Scheme operator member list adds an **Awaiting your acceptance** queue with Accept / Reject buttons.
- `acceptSchemeMember(memberId, { agencyCode })` allocates a BPRN against the producer's existing agency (falling back to the scheme's), updates the producer record, flips the registration to `Submitted`.
- `rejectSchemeMember(memberId, reason)` closes the membership.

### Phase 5 — Public register ✅ Done

- Search results gain a "Represented by" row (scheme name or em-dash).
- Search `q` filter matches scheme name as well as company name.
- `pendingScheme` producers (no BPRN yet) are filtered out of search and 404 on the detail page.
- Detail page renders a "Compliance scheme" section (name, operator, approval number) for scheme-represented producers.

### Phase 6 — Leaving a scheme ✅ Done

`/leave-scheme/reason → declaration → confirmation` wizard for a scheme member to become a direct registrant.

- Reason step: radio (`joinedAnotherScheme | belowThreshold | ceasedTrading | other`) with free-text required when "other".
- Declaration step: summarises chosen reason, lists the direct-registrant responsibilities, requires confirmation.
- Confirmation step: gov.uk panel with the new BPRN.
- `transitionToDirect({ producerEmail, compliancePeriod, reasonForLeaving, otherReason })` closes the membership, supersedes the old registration, creates a new `directRegistrant` registration (reusing the producer's existing BPRN where possible).
- Re-entry guard: if the producer is no longer on the scheme route, all leave-scheme steps redirect to `/account` (except the confirmation page, so it stays viewable after the transition).

### Phase 7 — Cross-cutting polish ✅ Done

- **Dashboard agency-mismatch banner** — if a scheme-represented producer's `agencyCode` differs from their scheme's (e.g. they moved address), a gov.uk notification banner says so.
- **`schemeSelect` agency filter** — radios are hidden client-side when the scheme's `agencyCode` doesn't match the producer's; a "no schemes in your agency" message shows when nothing matches; schemes without `agencyCode` stay visible to any producer.
- **`/dev/schemes`** — JSON dump of seeded schemes for debugging.
- Content: full English copy, Welsh stub keys throughout.

### Phase 8 — Documentation ✅ Done

This file, the README "Pages" table, and [ADR 0001](decisions/0001-scheme-membership-stays-in-producer-frontend-until-bcs-service-lands.md).

## Out of scope

| Item | Where it should live |
|---|---|
| BCS member-roster spreadsheet upload | `batteries-scheme-frontend` |
| `SchemeApproval` application form for new schemes | `batteries-scheme-frontend` |
| Scheme-side annual obligation submission | `batteries-scheme-backend` |
| Regulator approval/withdrawal of schemes | future agency frontend |
| Public scheme detail page | `batteries-scheme-frontend` |
| Real cross-service notification (producer-joins event) | message bus once both services exist |

## Deferred / known gaps

- **Feature flag** (`features.allowSchemeLeave`) — not implemented. Leave-scheme is always available; production wiring is a follow-up.
- **Manifest cache invalidation in dev** — `nunjucks/context/context.js` caches the webpack manifest at module load; touching a server file forces a nodemon restart, which re-reads it. Worth fixing for a smoother dev loop.
- **Accessibility sweep** — manual; no `axe-core` tooling installed.
