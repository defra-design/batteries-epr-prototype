# Obligations Calculations — Phased Implementation Plan

**Target service**: `batteries-producer-frontend` (this repo).
**Status**: planning. Assumes `COMPLIANCE-SCHEME-PLAN.md` is implemented and on `main`.
**Author context**: introduces a deterministic obligation engine that turns a producer's reported placed-on-market (POM) tonnage into a financing / collection obligation expressed in tonnes and (for portable batteries) a percentage-derived collection target. Modernises the read paths around NPWD's `Batteries.SchemeObligation` and the implicit per-producer obligation that is today only reconstructible by joining `ProducerRegistration` → `*AnnualSubmission` → regulator-set target tables.

Scope: **the producer's view of their own obligation** for a single compliance period, with deterministic recompute on amendment. The scheme-aggregate calculation (sum-of-members, splitting national obligation across schemes, evidence-note balance enforcement, financing reconciliation) stays out of scope and continues to belong in the eventual `batteries-scheme-backend`.

---

## 0. Why a producer-only obligation engine first

Three reasons:

1. **Determinism is high-value, low-risk.** An obligation calculation is a pure function of `(reported tonnage, battery category, compliance-period target)`. Land it as a single library module with exhaustive unit tests; the rest of the work is wiring.
2. **The numbers exist already.** Phase 4 of the compliance-scheme plan introduced per-period target reference data implicitly (the "your scheme reports on your behalf" view), and the annual-return wizard already captures POM tonnage. Connecting the two is mechanical.
3. **Scheme-represented producers see a meaningful number too.** Even though the scheme bears the obligation legally, the producer's *attributable share* (their POM × the period target) is informational and useful for the dashboard tile that today reads "your scheme reports on your behalf" with no figure attached.

Producer-side obligation visibility unblocks the dashboard, the public register, and the leave-scheme journey (which today silently swaps a scheme-represented producer to direct without telling them what their direct obligation would be). It does **not** depend on the scheme service existing.

---

## 1. Phase 0 — Decisions to lock before scaffolding

Each has a prototype default. Flag any the human disagrees with before Phase 1.

| # | Decision | Default for prototype |
|---|---|---|
| 1 | Which battery categories are obligation-bearing in the calc engine? | Portable only. Industrial/Automotive are collect-on-request — no percentage obligation. The IA annual return continues to capture tonnages but the engine returns `null` for IA categories. |
| 2 | How are period targets sourced? | Hard-coded reference table keyed by `compliancePeriod` in `src/server/obligations/targets.js`. The 2009 Regulations set portable collection at 45% from 2016 onwards. Use that for every seeded period until policy says otherwise. |
| 3 | Below-threshold handling (small producers <1 tonne portable POM)? | Engine returns `{ exempt: true, reason: 'belowThreshold', obligationTonnes: 0 }`. Threshold lives next to targets and is per-period to allow for future change. |
| 4 | Do we round, and to how many decimals? | Round-half-up to 3 decimal places of a tonne (i.e. kilograms). Matches the existing tonnage-input precision in the annual return (`coerceTonnes` in `storage-adapter.js`). |
| 5 | Do we expose the full calculation breakdown to the producer? | Yes — small "How is this calculated?" disclosure showing inputs and target %. Transparency is cheap; the legacy NPWD never exposed this and producers complained. |
| 6 | What is the obligation unit? | Tonnes (numeric) and a percentage of POM. We do **not** quote a financial value — fee schedules are out of scope. |
| 7 | Recompute trigger | Pure function, no caching. Recomputed on every render. The numbers are tiny; memoising buys nothing and adds an invalidation problem. |
| 8 | Do we surface obligations on the public register? | No. The public register shows compliance status (registered / not registered) but not obligation tonnages. NPWD does not expose them either; matching that posture avoids a policy review for the prototype. |
| 9 | What happens if a producer has multiple registrations in a period (e.g. left a scheme mid-period — see compliance-scheme plan §7)? | Sum POM across all `producerRegistration` rows in the period for that `producerId`. The supersession chain (`replacesId`) is followed; only the latest in each chain contributes. Test exhaustively. |

If any of these flip, the affected phase changes scope but not order.

---

## 2. Phase 1 — Reference data & pure calc engine

**Goal**: a fully unit-tested pure function that turns inputs into an obligation result. No UI, no storage adapter changes.

### 2.1 Reference data

`src/server/obligations/targets.js`:

```js
export const portableTargets = {
  '2024': { collectionRate: 0.45, deMinimisTonnes: 1.0 },
  '2025': { collectionRate: 0.45, deMinimisTonnes: 1.0 },
  '2026': { collectionRate: 0.45, deMinimisTonnes: 1.0 }
}

export const getPortableTarget = (compliancePeriod) => {
  const target = portableTargets[compliancePeriod]
  if (!target) {
    throw new Error(`No portable target configured for ${compliancePeriod}`)
  }
  return target
}
```

Frozen object. New periods added by extending the map. Keep both this module and `src/config/paths.js` as the only sources of period-level constants — do not scatter them.

### 2.2 Calc engine

`src/server/obligations/calculate.js`:

```js
export const calculateObligation = ({ compliancePeriod, pomTonnesPortable }) => { ... }
```

Returns:

```js
{
  compliancePeriod: '2026',
  pomTonnesPortable: '12.500',
  collectionRate: 0.45,
  obligationTonnes: '5.625',
  exempt: false,
  reason: null
}
```

Or, when below threshold:

```js
{
  compliancePeriod: '2026',
  pomTonnesPortable: '0.500',
  collectionRate: 0.45,
  obligationTonnes: '0.000',
  exempt: true,
  reason: 'belowThreshold'
}
```

Rules baked in:

- Inputs are decimal strings (matches `coerceTonnes`). Internal arithmetic uses `Number`; output rounded to 3dp via a single helper.
- `pomTonnesPortable === '0.000'` → exempt, reason `noTonnage`.
- Below `deMinimisTonnes` → exempt, reason `belowThreshold`.
- `compliancePeriod` outside the targets map → throws. The caller is expected to validate the period before calling. There are no fallbacks — silent rounding to a "nearest year" is exactly the kind of bug that erodes trust.

### 2.3 Aggregation helper

`src/server/obligations/aggregate.js` — given an array of `producerRegistration` rows for one `(producerId, compliancePeriod)`, returns the aggregated POM by following the supersession chain. This is the only place that walks `replacesId`; everywhere else uses the result.

### 2.4 Tests

`src/server/obligations/calculate.test.js` covers, at minimum:

- Portable POM at, just below, and just above the de minimis threshold.
- Rounding boundaries (`5.6249` → `5.625`, `5.6250` → `5.625`, `5.6251` → `5.625`).
- Zero, negative input rejected.
- Period not in target map throws.
- `compliancePeriod` value with leading whitespace or numeric type is rejected (Joi-style strict).

`aggregate.test.js` covers:

- Single registration → straight passthrough.
- Two-registration supersession chain → only latest counts.
- Two unrelated registrations in the same period → sum (the leave-scheme case).
- Mixed: a superseded chain plus an unrelated registration → sum the latest of the chain plus the standalone.

100% branch coverage required, same Vitest threshold as everywhere else.

**Exit criteria**: `npm test` green. No UI changes. The engine is callable from any controller via a single import.

---

## 3. Phase 2 — Storage adapter integration

**Goal**: a single function in `storage-adapter.js` that, given a `producerId` and compliance period, returns the calculated obligation for that producer. Thin wrapper, no new persistence.

### 3.1 Adapter additions

```js
export const getObligation = ({ producerId, compliancePeriod }) => {
  const registrations = listRegistrations(producerId, compliancePeriod)
  const pomTonnesPortable = aggregatePomPortable(registrations)
  return calculateObligation({ compliancePeriod, pomTonnesPortable })
}
```

Co-located helper `listRegistrations(producerId, compliancePeriod)` — strict filter by both keys.

Choices baked in:

- **No persistence.** The result is recomputed on read. We do not write `obligationTonnes` into the registration row. If a backend lands later (PRD §16 Phase 1b) it can choose to materialise; the frontend contract stays read-through.
- **No memoisation.** Numbers are small, the localStorage round-trip dwarfs the arithmetic, and we pay no invalidation cost.

### 3.2 Tests

- `storage-adapter.test.js` extended with read-through tests using seeded data.
- Test the leave-scheme aggregation case explicitly (the compliance-scheme plan added the seed fixture for this — reuse it).
- Test that an unknown producer returns `null` (not throws) — UI code should handle missing data idempotently.

**Exit criteria**: `getObligation()` callable from any client-side script with one import. Existing adapter tests untouched.

---

## 4. Phase 3 — Dashboard surface

**Goal**: the obligation appears on the dashboard for direct producers, and as an attributable share for scheme-represented producers.

### 4.1 Direct producers (small + direct)

`src/server/dashboard/index.njk` adds an "Obligation" tile alongside the existing tiles:

- For `producerRoute === 'directRegistrant'` and not below threshold: "Your collection obligation for {period} is **{obligationTonnes} tonnes** — {collectionRate * 100}% of your reported {pomTonnesPortable} tonnes placed on market."
- Below threshold: "You are below the {deMinimisTonnes}-tonne threshold for {period} — no collection obligation applies." Different copy for `noTonnage` vs `belowThreshold`.
- Pre-submission (no annual return filed yet for this period): "We will calculate your obligation when you file your annual return." Hide the breakdown.

### 4.2 Scheme-represented producers

The compliance-scheme plan replaced the annual-return tile with a "scheme reports on your behalf" tile. Augment that tile with:

- "Your attributable share for {period} would be **{obligationTonnes} tonnes** based on your last reported POM. {scheme} carries the legal obligation."

This is intentionally informational and labelled `would be`. Do not imply the scheme has filed the producer's specific number with the regulator — it has not, only the scheme aggregate is filed.

### 4.3 Disclosure widget

`src/server/common/templates/components/obligation-breakdown.njk` — re-used across dashboard, account, and the post-submission confirmation. Renders the inputs and a one-line formula. No styling beyond the GDS details component. Decision (#5) above mandates this is visible by default; the details disclosure is a "Show working" expansion that exposes the full reference-data citation.

### 4.4 Tests

- Dashboard test for each branch: pre-submission, post-submission direct, post-submission below-threshold, scheme-represented with prior submission, scheme-represented without prior submission.
- Snapshot the disclosure widget with three input shapes (with breakdown, exempt, no data).

**Exit criteria**: refresh `/dashboard` against each seeded demo producer and see the right tile content.

---

## 5. Phase 4 — Annual return integration

**Goal**: at the end of the annual-return wizard, show the producer the obligation that follows from what they just submitted.

### 5.1 Confirmation page

`src/server/annualReturn/smallProducer/confirmation/` and any equivalent direct-registrant confirmation gain a new "Your obligation" panel below the existing "We've recorded your return" message:

- "Based on your submission of {pomTonnesPortable} tonnes, your collection obligation for {period} is **{obligationTonnes} tonnes**."
- Or the appropriate exempt copy.
- Re-uses `obligation-breakdown.njk`.

### 5.2 Recompute on amendment

Critical correctness path: if a producer amends a prior submission (the supersession chain — covered in compliance-scheme plan §7.3 and now exercised in obligations Phase 1.3), the obligation must reflect the *aggregated* POM, not just the latest standalone row.

The aggregate helper from Phase 1.3 already handles this. The only thing the controller does is call `getObligation()` post-write. A controller test asserts the recomputed value after an amendment.

### 5.3 IA annual return

The IA path stays untouched. The engine returns `null` for IA categories (decision #1). The IA confirmation page shows a one-line "Industrial and automotive batteries are collect-on-request — no tonnage-based obligation applies."

### 5.4 Tests

- Confirmation render test for direct + small + IA variants.
- Amendment test: file an annual return, file an amendment with different tonnage, confirm the obligation reflects the *latest* tonnage in the chain (not summed).
- Period-boundary test: a producer with submissions in 2025 and 2026 sees the 2026 obligation on a 2026 confirmation page, not a sum.

**Exit criteria**: full submission flow ends on a confirmation page that includes the obligation panel. Amendments recompute correctly.

---

## 6. Phase 5 — Account surfaces

**Goal**: a returning producer can see the obligation history across compliance periods.

### 6.1 Account page

`src/server/account/view.njk` adds an "Obligations" row that links to a new `/account/obligations` page.

### 6.2 Obligations history page

New feature `src/server/account/obligations/`:

- Read-only table, one row per compliance period the producer has activity in, columns: period, POM (portable), collection rate, obligation, status (e.g. `Calculated`, `Pending submission`, `Exempt — below threshold`, `Exempt — no tonnage`, `Scheme-represented`).
- Most-recent period first.
- No POSTs.

### 6.3 Time-travel interaction

`/dev/time-travel` already exists. Confirm the obligations page renders correctly when the active period is moved. Add a regression test.

### 6.4 Tests

- Controller test for the read path.
- Snapshot test of the table for a producer with 3 periods of mixed states (filed, exempt, scheme-represented).
- 404 when an unknown producer is signed in (defensive — should not happen with the existing auth-gate but cheap to assert).

**Exit criteria**: the account page links to `/account/obligations` and renders the multi-period view.

---

## 7. Phase 6 — Leave-scheme follow-through

**Goal**: when a producer leaves a scheme via the journey introduced in the compliance-scheme plan §7, they see what their direct-registrant obligation will be **before** they confirm.

### 7.1 Decision context

Today the leave-scheme wizard in the compliance-scheme plan has three steps: reason → declaration → confirmation. The producer agrees to take on direct-registrant compliance without ever being shown what that means in tonnes. Plug obligations into the declaration step so the consequence is explicit.

### 7.2 Declaration step augmentation

`src/server/leaveScheme/declaration/view.njk` adds a panel above the declaration text:

- "Your last reported POM is {pomTonnesPortable} tonnes. As a direct registrant for {currentPeriod}, your collection obligation will be **{obligationTonnes} tonnes**."
- Or the exempt copy if applicable.

If the scheme has been carrying the producer with no producer-side POM data (very common — schemes file aggregate), the panel shows "We do not yet hold a tonnage figure for you. You will be asked to file an annual return as a direct registrant after leaving."

### 7.3 No new storage transitions

The leave-scheme transitions are unchanged from the compliance-scheme plan §7.3. This phase is read-only against `getObligation()`.

### 7.4 Tests

- Render test for each branch (have-tonnage / no-tonnage / exempt) on the declaration step.
- Confirm the leave-scheme wizard still completes end-to-end with the panel present.

**Exit criteria**: the leave-scheme journey ends with the producer informed of the consequences in tonnes.

---

## 8. Phase 7 — Cross-cutting polish

Hold until phases 1–6 are working, otherwise rework risk.

### 8.1 Dev tooling

- New `/dev/obligations?producerId=…&period=…` JSON endpoint returning the engine output. Production-gated to 404 like `/dev/reset`.
- `/dev/time-travel` — when the period is changed, the obligations history page recomputes. Already covered if Phase 6.3 lands.
- Dev-mode banner appears on any page that calls `getObligation()` with a future-dated period (i.e. the producer has filed a return and time-travel has rolled the clock back) so the demo doesn't accidentally show stale numbers.

### 8.2 Reference-data extension

Add an ADR `/docs/decisions/0002-period-targets-stay-hard-coded-until-policy-service-lands.md` explaining why `targets.js` is a frozen literal and not seed data: the values are policy, not user data, and a regulator-driven change should land via PR, not a seed edit. When the future `batteries-policy-backend` exists this can be revisited.

### 8.3 Content / accessibility sweep

- Each new page asserts: single `<h1>`, alt text on any imagery, no nested `<a>`s, focus management on the disclosure widget.
- Welsh stubs added for every new content key (English copy verbatim).
- The `obligation-breakdown.njk` partial uses semantic table markup for the inputs (axe-friendly).
- One end-to-end accessibility check on `/account/obligations` with `axe-core` — the multi-row table is the most likely WCAG failure surface.

### 8.4 Visual / template tidy

- One govuk-tag per status: `Calculated` (blue), `Pending submission` (grey), `Exempt` (grey), `Scheme-represented` (purple). Define once.
- The phrase "collection obligation" appears consistently — never "collection target", which is reserved for the regulator-set percentage.

---

## 9. Phase 8 — Documentation

- `CLAUDE.md` "Architecture" — add `src/server/obligations/` and the `getObligation()` storage seam.
- `README.md` "Pages" table — add `/account/obligations`.
- This file (`OBLIGATIONS-PLAN.md`) — mark phases `Done` as they ship; do not delete. It documents the contract that the future `batteries-scheme-backend` aggregate calculation will inherit (sum of `getObligation()` across members for a scheme = the scheme's portable collection obligation).
- Update `COMPLIANCE-SCHEME-PLAN.md` to add a one-line note under §4.1 ("annual-return tile augmentation") pointing at the obligations plan, so future readers wire the two changes together correctly.

---

## 10. Out of scope (do not build in this repo)

| Item | Where it should live |
|---|---|
| Scheme aggregate obligation (sum-of-members) | `batteries-scheme-backend` |
| National obligation split across schemes (regulator action) | `batteries-agency-frontend` (PRD §16 Phase 4) |
| Evidence-note balance — the running tally of evidence issued by AATFs/AEs against the obligation | `batteries-reprocessor-backend` (PRD §16 Phase 3) |
| Financial obligation (£ value of unmet collection) | Out of scope until policy provides a published unit cost. |
| Industrial / automotive obligation modelling | Statute is collect-on-request, not percentage. Revisit only if regulations change. |
| Cross-period reconciliation (rolling shortfalls / surpluses) | A backend concern. The frontend reads point-in-time figures. |
| Multi-year forecasts | Not a regulatory feature — drop unless a stakeholder asks for it. |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Reference-data drift — the 45% target changes via legislation and we miss it. | The `targets.js` map is the only source. An ADR (Phase 7.2) records the policy citation. A PR template note prompts reviewers to confirm policy when editing the file. Add a top-of-file comment with the legislation reference *only here* — explicit exception to the no-comments rule because the WHY is non-obvious and the cost of staleness is regulatory. |
| Floating-point drift causes off-by-1-kg errors in obligations. | Round once, in one helper, at the boundary of the engine. All consumers receive strings. Tests cover the half-up boundary explicitly. |
| Producer sees an obligation figure for a period before they have submitted, confusing them. | Pre-submission state is rendered as "We will calculate your obligation when you file your annual return" with no number. Decision #5 disclosure stays hidden until there is data. |
| Scheme-represented producer assumes the "attributable share" is what the scheme has filed for them. | Copy explicitly says `would be` and "based on your last reported POM" — never "your scheme has filed". Content review on the dashboard tile before merge. |
| Amendment recompute fails to follow the supersession chain and a stale obligation lingers. | Aggregate helper has a dedicated test file with multi-row scenarios. The dashboard re-reads on every render (no cache). |
| `/dev/obligations` endpoint leaks producer data in a non-production environment that's accidentally internet-facing. | Same gate as `/dev/reset` — `!config.isProduction`, returning 404 in production. Document the intent in the route handler with a single-line comment (justified exception, same reasoning as the legislation citation). |
| The IA "no obligation" copy is misread as "no compliance duty whatsoever". | Phrase it as "no tonnage-based collection obligation — collect-on-request duties under the 2009 Regulations still apply" with a link to gov.uk guidance. |

---

## 12. Suggested ordering / parallelism

Phases 1 → 2 are strictly sequential (engine before adapter). Once Phase 2 is on `main`, Phases 3, 4, 5 and 6 can run in parallel — they each consume `getObligation()` and don't depend on each other. Phase 7 is polish — pull tasks from it as you finish each parallel branch. Phase 8 is the final commit.

A reasonable cadence: Phase 1 ~1 day (the test matrix is the bulk of it), Phase 2 ~½ day, Phases 3/4/5/6 ~½–1 day each, Phase 7 ~½ day, Phase 8 ~half-hour. Total ≈4–5 working days for one engineer. The largest unknown is content review on the dashboard "attributable share" copy — secure that early.
