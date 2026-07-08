# Configurable obligations: EUBR + GB Compliance Scheme

_What it would take to serve both regulations from one config-driven obligation engine._

## The two engines today

| | **GB Compliance Scheme** (`complianceScheme/obligation.js`) | **EUBR / NI** (`ni/obligation/calculator.js` + `targets.js`) |
|---|---|---|
| Legal basis | Waste Batteries Regs 2009 / retained Directive 2006/66/EC | EU Batteries Regulation 2023/1542 |
| Streams | 3: portable, industrial, automotive | 5: portable, LMT, industrial, EV, SLI |
| Collection target | one flat % per category (`placed × target`) | two models: **phased %** (portable/LMT, rates rise by year) and **take-back** (industrial/EV/SLI, "all returned") |
| Placed-on-market basis | sum of the year's quarterly `marketData` | **3-year rolling average** |
| Recycling target | flat % per category | **by chemistry** (lead-acid 80 / lithium 65 / Ni-Cd 80), recycling *efficiency* |
| Time phasing | static (regulator-editable) | hard-coded year thresholds (2023→2027→2030…) |
| Obligated entity | scheme (aggregates members) | producer |
| Return cadence | quarterly submissions | annual returns |
| Configurable by | regulator UI (`saveRegulatorTargets` per agency) | not configurable — baked into `targets.js` |

The key point: both are the *same shape* — `streams × (target model) × (POM aggregation) → obligation vs. evidence → shortfall` — differing only in parameters and in the *type* of target function. That is what makes a config-driven merge feasible.

## What has to become configurable

Six axes, roughly in order of cost:

**1. The stream set.** Today `CATEGORIES` is a hard-coded array in two places. Make it a per-regime list (GB = 3, EUBR = 5). Everything downstream (rows, form fields, `marketData` keys) must key off this list rather than literals.

**2. The target model per stream — the big one.** GB has one model; EUBR has three. Make target evaluation *polymorphic* — a stream declares its model and the engine dispatches:

- `fixed-percentage` → `placed × rate` (current GB)
- `phased-percentage` → pick rate from year thresholds, then `× placed` (EUBR portable/LMT)
- `take-back` → obligation = "all returned"; shortfall only if collected < returned (EUBR industrial/EV/SLI; GB industrial/automotive already model this as 100%)
- `recycling-efficiency` → measured against processed weight, keyed by chemistry not category

The NI `targets.js` already encodes `COLLECTION_TARGET` vs `TAKE_BACK` as model discriminators — that enum is the seed of the abstraction.

**3. Placed-on-market aggregation.** Single-year sum vs N-year rolling average is a one-line strategy: `averagingWindow: 1` (GB) vs `averagingWindow: 3` (EUBR). `averagePlacedOnMarket` already parameterises this; GB just needs to route through the same function with window 1.

**4. Time phasing of rates.** GB currently stores a scalar per target; EUBR needs `[{ from: year, rate }]`. Unify on the *threshold array* form — a static target is a single-element array. `collectionRate(thresholds, year)` in the NI calc already does the lookup.

**5. Recycling dimension keying.** GB keys recycling by category; EUBR keys by chemistry. Make the recycling target set independent of the collection stream set (recycling targets reference a chemistry taxonomy, collection targets reference a stream taxonomy).

**6. Obligation *types* beyond collection/recycling.** EUBR carries obligations that don't fit `placed × target` at all — recycled-content minimums (Art 8), carbon footprint, due diligence, battery passport, labelling. The `eubr.js` catalogue already lists these as declarative `{ articles, title, appliesFrom }` records. Treat those as a separate class of "declarative obligations" (attestation / date-gated, not a tonnage calc) rather than forcing them through the numeric engine.

## Proposed shape: one regime config, one engine

Collapse `targets.js`, the GB `DEFAULT_TARGETS`, and the regulator-saved overrides into a single **regime descriptor**:

```js
const regimes = {
  'gb-compliance': {
    label: 'GB Compliance Scheme',
    obligatedEntity: 'scheme',
    returnCadence: 'quarterly',
    averagingWindow: 1,
    streams: [
      { id: 'portable',   model: 'phased-percentage', thresholds: [{ from: 2023, rate: 0.45 }] },
      { id: 'industrial', model: 'take-back' },
      { id: 'automotive', model: 'take-back' }
    ],
    recycling: { keyBy: 'category', targets: { portable: 0.45, industrial: 0.5, automotive: 0.5 } }
  },
  'eubr': {
    label: 'EU Batteries Regulation',
    obligatedEntity: 'producer',
    returnCadence: 'annual',
    averagingWindow: 3,
    streams: [
      { id: 'portable', model: 'phased-percentage',
        thresholds: [{ from: 2023, rate: 0.45 }, { from: 2027, rate: 0.63 }, { from: 2030, rate: 0.73 }] },
      { id: 'lmt', model: 'phased-percentage',
        thresholds: [{ from: 2028, rate: 0.51 }, { from: 2031, rate: 0.61 }] },
      { id: 'industrial', model: 'take-back' },
      { id: 'ev',  model: 'take-back' },
      { id: 'sli', model: 'take-back' }
    ],
    recycling: { keyBy: 'chemistry',
      targets: { 'lead-acid': 0.80, 'lithium': 0.65, 'nickel-cadmium': 0.80 } },
    declarativeObligations: ['recycledContent', 'carbonFootprint', 'dueDiligence', 'batteryPassport']
  }
}
```

One engine that both regimes call:

```js
calculateObligation({ regime, returns, evidence, year })
```

Internally it loops the regime's `streams`, dispatches on `model`, applies `averagingWindow` to placed-on-market, resolves rates via the threshold lookup, and produces the same `{ stream, placed, obligation, accepted, shortfall, status }` rows both UIs already render. The GB regulator-targets UI generalises to "edit the active regime's threshold array" — and its per-agency override storage becomes per-*regime* override storage.

## Effort & sequencing

The honest read: the **NI engine is already ~80% of the general engine** — phased thresholds, rolling average, take-back vs percentage, chemistry recycling are all there. The work is mostly *promoting* it to config-driven and *retiring* the simpler GB calc into it.

1. Extract the regime descriptor (above) into `src/config/regimes.js`; express GB as a degenerate case (window 1, single-threshold, category recycling).
2. Generalise `calculator.js` to take a regime instead of importing `targets.js` constants; add the `fixed`/`phased` unification (trivial) and dispatch on `model`.
3. Point `complianceScheme/obligationPage` at the shared engine; delete `obligation.js`'s bespoke `buildObligation`.
4. Make `CATEGORIES` / form fields / `marketData` keys derive from `regime.streams`.
5. Generalise regulator-targets storage from per-agency to per-regime (or per-agency-per-regime).
6. Keep `declarativeObligations` as a separate, non-numeric surface driven off `eubr.js` — don't force them into the tonnage engine.

## Configurability matrix

Which values vary along which dimensions — i.e. what the config model actually needs to key on.

**Legend:** Configure = genuinely varies on this dimension · Partial = edge case, configure only if needed · Fixed = doesn't sensibly vary here

| Value ↓  /  Dimension → | Regime | Compliance year | Regulator (agency) | Battery stream | Chemistry |
|---|:---:|:---:|:---:|:---:|:---:|
| **Battery stream set** | Configure | Partial | Fixed | — | Fixed |
| **Collection targets (rate %)** | Configure | Configure | Configure | Configure | Fixed |
| **Collection target model** (%/take-back) | Configure | Fixed | Fixed | Configure | Fixed |
| **Recycling efficiency targets (%)** | Configure | Configure | Partial | Fixed | Configure |
| **Recycled content minimums (%)** | Configure | Configure | Fixed | Partial | Configure |
| **Placed-on-market averaging window** | Configure | Fixed | Fixed | Fixed | Fixed |
| **Declarative obligations** (passport, due diligence, carbon footprint, labelling) | Configure | Configure | Fixed | Configure | Fixed |
| **Return cadence** (quarterly/annual) | Configure | Fixed | Fixed | Fixed | Fixed |
| **Obligated entity** (scheme/producer) | Configure | Fixed | Fixed | Fixed | Fixed |

### Reading the matrix

- **Regime is the primary key** — every value varies by regime, so `regime` is the top-level config object. Everything else is nested inside it.
- **Collection targets are the most-configured value** — they legitimately vary on four dimensions at once (regime × year × agency × stream). That's the cell that justifies the full `streams[].thresholds[]` structure and per-agency overrides.
- **Compliance year drives phasing** — EUBR collection rates rise (2023→2027→2030), recycling efficiency ramps, recycled-content minimums switch on (2031/2036), and declarative obligations each have an `appliesFrom` date. Year is a *lookup axis*, not a stored-per-year copy.
- **Regulator (agency) is a narrow override axis** — only targets sensibly vary by agency, and only because policy delegates rate-setting. The prototype already does this via `saveRegulatorTargets(agencyCode)`. Recycling override (Partial) is plausible but more centrally set. Nothing structural (streams, models, cadence, entity) should vary by agency.
- **Stream vs chemistry are different taxonomies** — collection keys on **stream** (portable/LMT/industrial/EV/SLI); recycling efficiency and recycled content key on **chemistry** (lead-acid/lithium/Ni-Cd/cobalt/nickel). Keep the two taxonomies independent — this is why recycling targets can't just hang off the stream list.
- **The Fixed-heavy rows are regime constants** — averaging window, return cadence, and obligated entity vary *only* by regime. They're single scalars per regime, not matrices.

### Partials worth noting

- **Stream set × year (Partial)** — the taxonomy is stable, but which streams have *active* targets changes (LMT collection starts 2028). Handle via each stream's `thresholds` starting year, not by versioning the stream list per year.
- **Recycling targets × regulator (Partial)** — technically overridable, but recycling efficiency is set nationally; expose the override only if the service genuinely needs agency discretion.
- **Recycled content × stream (Partial)** — applies to industrial/EV/SLI containing the relevant materials, not portable; it's really keyed by chemistry-within-stream rather than stream alone.

## The one genuine caveat

The two regimes aren't *only* different parameters — they differ in **who is obligated** (scheme vs producer) and **return cadence** (quarterly vs annual), which touches data model and workflows, not just the calc. The numeric engine unifies cleanly; the surrounding registration / return-submission flows are where "configurable" gets harder.

Scope the first pass to the **obligation calculation + targets config** (very achievable, mostly consolidation) and treat entity-model / cadence divergence as a separate decision.
