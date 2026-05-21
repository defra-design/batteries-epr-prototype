# 0001 — Scheme membership stays in the producer frontend until the dedicated scheme service lands

- **Status**: Accepted
- **Date**: 2026-05-21
- **Service**: `batteries-epr-prototype`

## Context

The original PRD splits the eventual production system into several services: a producer frontend (this repo), a `batteries-scheme-frontend` for compliance-scheme operators, a `batteries-reprocessor-frontend`, and a regulator-facing service. The compliance-scheme functionality — approving schemes, accepting members, filing rosters, evidence accounting — was scoped to the future scheme frontend.

The producer-side experience of *being a member of a scheme* is small: an onboarding fork (pick a scheme), a dashboard tile, an account row, a "leave scheme" wizard, and the divergence point on the annual return. None of this requires the operator-side machinery; it just needs to know which scheme the producer belongs to.

The prototype's job is to validate user journeys and copy end-to-end. A producer who picks "compliance scheme" but then sees a 404 (because the scheme side doesn't exist) is not a useful prototype.

## Decision

Build the producer-side compliance-scheme membership flow inside this repo now. Stub a minimum-viable operator-side member-acceptance flow alongside it so the end-to-end journey can be walked in a single browser session.

## Scope of the slice

In this repo:

- Producer onboarding fork (`Small | Direct | Compliance scheme`) with `schemeSelect` + `schemeConfirm` steps.
- Dashboard tile and `/account/scheme` detail page for scheme-represented producers.
- Annual-return route gate redirecting scheme producers to an informational page.
- `/leave-scheme/*` wizard moving a member back to direct.
- Operator-side `/compliance-scheme/members` gains an **Awaiting your acceptance** queue with accept/reject actions that allocate a BPRN and update the producer record. This is the minimum surface to close the producer's loop end-to-end.

## Out of scope (lives in the future scheme service)

- BCS member-roster spreadsheet upload (`Public/Batteries/BatteriesSchemeReg.vb` in NPWD).
- Full `SchemeApproval` application form for new schemes.
- Scheme-side annual obligation submission.
- Regulator approval/withdrawal of schemes.
- Public scheme detail page.

## Consequences

**Positive**

- End-to-end prototype walkthrough works in a single browser session.
- The producer-side data model is settled before the scheme service starts — `schemes` and `schemeMembers` collections in `storage-adapter.js` become the contract the future `batteries-scheme-{frontend,backend}` will be built against. The producer service moves to those backend APIs via the existing storage seam without UI changes.
- Validates the cross-service interaction model (producer notifies scheme on join; scheme issues BPRN on accept) before either side is locked in.

**Negative**

- The operator-side acceptance flow in this repo is a stub. When `batteries-scheme-frontend` lands, that surface will be replaced and the stub deleted from this repo.
- The data model assumes a single producer service writing to it; when there are two services they will need to agree on how a producer joining sees their membership and how a scheme accepting writes the BPRN. The storage seam already isolates this.
- `producerEmail` on `schemeMember` is a prototype convenience for linking the membership back to the producer record before a BPRN exists. In production this would be the scheme's own internal reference, not the producer's email.

## Revisit when

`batteries-scheme-frontend` exists and is ready to take over the operator surface. At that point:

1. Delete `/compliance-scheme/*` from this repo.
2. Replace `joinScheme` / `leaveScheme` / `acceptSchemeMember` / `rejectSchemeMember` calls with cross-service API calls behind the existing storage seam.
3. Keep `/account/scheme`, `/leave-scheme/*`, `/onboarding/scheme-{select,confirm}`, and the dashboard tile — those are producer-side and remain.
