# Battery categories as configuration (GB)

_The GB/UK regulatory battery categories are held as data, so the set can be
changed, renamed or re-scoped without touching the code that keys off them._

## Regulator-managed, per-agency categories

Regulators manage the category set from the UI at **`/regulator/categories`** — add,
remove, rename and reorder — **per agency** (EA/NRW/SEPA/NIEA), persisted to
`localStorage` under `regulatorCategories` and recorded in the shared config audit
trail (entries carry `configType: 'category'`). This mirrors the `regulatorTargets`
flow (`storage.saveRegulatorCategories` / `diffCategories` /
`resolveCategories(agencyCode)` in `src/client/javascripts/storage-adapter.js`).

`src/config/battery-categories.js` is the **default/seed** — `resolveCategories`
falls back to it when an agency has no stored set.

Because the Hapi server can't read a browser's `localStorage`, the agency-scoped
surfaces — quarterly market/waste tonnes, evidence category radios, check-answers,
the obligation breakdown, **and the regulator targets page** — **render their fields
client-side** from `resolveCategories(scheme.agencyCode)`, and any server-side Joi
schemas are built **per request** from a hidden `categoryIds` field the form submits
(see `parseCategoryIds` + `buildSchema` in the quarterly and evidence `steps.js`, and
`parseCategoryIds` in the targets controller). Validation therefore checks format and
completeness against the client-declared list; membership can't be independently
verified server-side while the browser is the source of truth.

A newly added category gets its own collection/recycling target inputs on
`/regulator/targets` (defaulting to 0%), and `resolveTargets` keys off whatever the
agency has stored, so the new target flows straight into the obligation calculation.

## Source of truth

`src/config/battery-categories.js` holds an ordered list of categories, each with
a stable `id` and display labels:

```js
export const BATTERY_CATEGORIES = [
  { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
  { id: 'industrial', label: 'Industrial batteries', shortLabel: 'Industrial' },
  { id: 'automotive', label: 'Automotive batteries', shortLabel: 'Automotive' }
]
```

Helpers derive everything else: `categoryIds`, `categoryLabels`,
`categoryShortLabels`, `categoryFieldName(prefix, id)` (e.g. `collectionPortable`),
`categoryFlagName(id)` (e.g. `isPortable`) and `emptyCategoryMap(value)`.

Both server (`src/server/**`) and client (`src/client/javascripts/**`) import from
this one module — webpack bundles it into the client just like `config/fees.js`.

## What derives from it

- **Obligation** — `complianceScheme/obligation.js` builds one row per `categoryIds`.
- **Regulator targets** — server controller + client hydration + the targets grid
  iterate `categoryIds` and build field ids with `categoryFieldName`.
- **Forms** — the quarterly market-data / waste-data schema, the onboarding
  battery-type checkboxes, and the evidence category radios are generated from the
  config (Joi schemas built by mapping over `categoryIds`; templates loop over a
  `categories` list passed by the controller).
- **Storage/seed defaults** — `emptyCategoryMap()` and `is<Category>` flags are
  generated from the config; `storage-seed.json` uses the same category ids.

To add, rename or re-scope a GB category, edit `BATTERY_CATEGORIES` only. A new id
flows through the obligation table, the quarterly forms, the onboarding checkboxes,
the regulator targets grid and the check-your-answers summary with no other code
change. (Per-language display copy — hints and bespoke error messages — lives in
`config/content.js` keyed by id, so a new category would want its copy added there;
the canonical label falls back to `battery-categories.js`.)

## Deliberate boundaries

- **Named-subset journeys are not generic.** The "industrial and automotive"
  journey (`server/complianceScheme/industrialAutomotive/*`,
  `server/annualReturn/shared.js` `IA_CATEGORIES`) and the small-producer flow are
  about a fixed, named subset of categories. `IA_CATEGORIES` still names the
  `industrial` and `automotive` ids explicitly, so it neither absorbs a brand-new
  category nor tracks a rename of those two ids on its own — the full-set flow
  (quarterly / market-data / obligation) is where a new category appears
  automatically.
- **NI / EU Batteries Regulation is out of scope.** The NI five-category system
  (`ni/obligation/targets.js`) is its own structured config and serves as the
  "another regime" example. See `docs/configurable-obligations.md`.

## Simplification caveat

These are **demonstration categories for the playground, not the authoritative
statutory battery-category definitions** (`CATEGORY_CAVEAT`). The caveat is surfaced
via `govukInsetText` on the onboarding battery-types screen and the regulator
targets screen.
