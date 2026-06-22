# Northern Ireland (EUBR) Producer Prototype — Phased Plan

## Context

Northern Ireland producers placing batteries on the market are governed by the **EU Batteries Regulation (EU) 2023/1542 (EUBR)**, which applies directly in NI from **18 February 2024** under the Windsor Framework (replacing the 2006/66/EC Batteries Directive). DAERA is the NI regulator, working with Defra; the producer responsibility scheme runs UK‑wide. The existing prototype models the **GB** producer/scheme/regulator journeys only.

We need a **new, self‑contained prototype journey** for an NI producer that:

1. Mirrors a full producer journey (sign‑in → dashboard → onboarding/registration → annual return) but framed for NI + EUBR, and adds EUBR‑specific screens that have no GB equivalent (carbon‑footprint declaration, battery passport / QR labelling, due diligence).
2. Lets the user toggle an **"EUBR mode" overlay** that outlines every meaningful area of the UI and, on hover or keyboard focus, shows a tooltip naming the **EUBR article(s)** that area implements.

**Hard constraint:** this must not change any existing journey. All new work lives under a new route prefix (`/ni/...`), a new server folder (`src/server/ni/`), new templates, new assets, and additive‑only edits to shared wiring (`router.js`, `paths.js`, `webpack.config.js`, SCSS/global index files).

Decisions confirmed with the user: **full parallel journey**, **add EUBR‑specific screens**, **toggleable overlay + hover tooltip**.

---

## Architecture recap (how the prototype works)

- **Routes:** each feature is a folder under `src/server/<feature>/` exporting `{ openRoutes: [...] }` from `index.js`, with a `controller.js` and a `*.njk` view. All are registered additively in `src/server/router.js` (`Object.entries({...})` map).
- **Paths:** centralised constants in `src/config/paths.js`; `pathTo(route, params)` fills `{param}` placeholders.
- **Layout:** views extend `layouts/page.njk` (`src/server/common/templates/layouts/page.njk`), which sets the GOV.UK header, service navigation, "Prototype" phase banner and loads `application.js`. Multi‑step journeys add an intermediate `_layout.njk` (e.g. `common/templates/onboarding/_layout.njk`).
- **Client assets:** one webpack entry per page in `webpack.config.js`; the view loads it via `{{ getAssetPath('<name>.js') }}` in `{% block bodyEnd %}`. SCSS components live in `src/client/stylesheets/components/<name>/_<name>.scss` and are registered in `components/_index.scss` (imported by `application.scss`).
- **Nunjucks globals:** every named export from `src/config/nunjucks/globals/globals.js` is auto‑registered as a template global (see `nunjucks.js:49`). Shared per‑request view context comes from `src/config/nunjucks/context/context.js`.
- **Content:** copy is centralised in `src/config/content.js`.
- No tooltip/annotation component exists today — it will be built fresh.

---

## EUBR legislation mapping (single source of truth)

A new config module `src/config/eubr.js` exports an `eubrArticles` map: each key → `{ articles, title, summary, appliesFrom }`. This is the **one place** legislation text is defined; templates reference it by key via the annotation macro, and the overlay JS reads it from `data-*` attributes the macro emits. Indicative mapping (article numbers per Regulation (EU) 2023/1542):

| Key | UI area | EUBR article(s) | Applies from |
|---|---|---|---|
| `registration` | Producer registration / BPRN | Arts 55–57 (registration before placing on market) | 18 Aug 2025 |
| `epr` | Extended producer responsibility / scheme | Arts 54, 56 (operational + financial EoL responsibility), PRO appointment | 18 Aug 2025 |
| `batteryCategories` | Battery type/category selection | Art 3 definitions; Annex I categories (portable, LMT, industrial, EV, SLI) | 18 Feb 2024 |
| `carbonFootprint` | Carbon‑footprint declaration screen | Arts 7–10 (CF declaration, performance classes, max thresholds) | phased 2025–2028 |
| `restrictedSubstances` | Hazardous/restricted substances | Art 6 + Annex I (mercury, cadmium, lead restrictions) | 18 Feb 2024 |
| `labelling` | Labelling & marking | Art 13 (separate‑collection symbol, capacity, CE, hazardous‑substance marking) | from 18 Aug 2026 / 2027 |
| `batteryPassport` | Battery passport / QR code screen | Art 77 + Art 13(6) QR (LMT, industrial >2 kWh, EV) | 18 Feb 2027 |
| `dueDiligence` | Due‑diligence policy screen | Arts 48–53 (due‑diligence policy, risk management, third‑party verification) | 18 Aug 2025 (guidance 2027) |
| `removability` | Removability & replaceability | Art 11 (portable batteries removable/replaceable by end‑user) | 18 Feb 2027 |
| `collectionTargets` | Collection / take‑back obligations | Art 59 (portable), Art 60 (LMT), Art 61 (industrial/EV take‑back) | phased from 2023 |
| `recyclingEfficiency` | Recycling efficiency & material recovery | Art 71 + Annex XII (efficiency + Co/Li/Ni/Pb recovery targets) | phased from 2025 |
| `recycledContent` | Recycled‑content declaration | Art 8 (minimum recycled Co/Pb/Li/Ni shares) | from 18 Aug 2028 |
| `informationEndUsers` | Information to end‑users | Art 74 | 18 Aug 2025 |
| `reporting` | Annual return / reporting to authority | Arts 75–76 (reporting to competent authority) | from 2025 |
| `dueDiligenceScope` | Due‑diligence scope gate (€40m turnover) | Art 48(2) net‑turnover threshold | 18 Aug 2025 |

> Implementation note: confirm each article number against the consolidated text on EUR‑Lex (`eur-lex.europa.eu/eli/reg/2023/1542/oj/eng`) while authoring `eubr.js`; the summaries should be one short sentence each, written for a service‑team audience, not legal text. Where an area maps to several articles, list them all.

---

## Phase 1 — Foundation & EUBR config

Goal: route prefix, NI layout, shared legislation config, and a working `/ni/sign-in` + `/ni/dashboard` skeleton.

1. **`src/config/eubr.js`** — export `eubrArticles` (the map above) and a helper `eubrAttrs(key)` returning the `data-eubr-*` attribute object for a key (used by the macro). Pure data, no `any` types.
2. **Register global** — re‑export `eubrArticles` from `src/config/nunjucks/globals/globals.js` so templates can read `eubr` (additive; existing globals untouched).
3. **Paths** — add NI constants to `src/config/paths.js`:
   `niSignIn: '/ni/sign-in'`, `niDashboard: '/ni/dashboard'`, `niOnboarding: '/ni/onboarding/{step}'`, plus one constant per onboarding step and `niAnnualReturn: '/ni/annual-return/{step}'` (mirror the existing onboarding/annual‑return naming).
4. **NI layout** — `src/server/common/templates/ni/_layout.njk` extending `layouts/page.njk`:
   - override the service‑navigation name to "Batteries EPR — Northern Ireland (EUBR)" and add a distinguishing banner ("Northern Ireland producer · EU Batteries Regulation 2023/1542") so the prototype is visually distinct from GB.
   - add the **EUBR mode toggle** control (a `govukButton`/switch with `data-eubr-toggle`) in `beforeContent`.
   - in `bodyEnd`, `{{ super() }}` then load the overlay bundle: `{{ getAssetPath('niEubr.js') }}`.
5. **Sign‑in + dashboard** — `src/server/ni/signIn/` and `src/server/ni/dashboard/` (index/controller/view), views extend `ni/_layout.njk`. Dashboard shows EUBR‑framed task cards (registration, carbon footprint, battery passport, due diligence, annual return), each card wrapped in the annotation macro (Phase 2).
6. **Router** — add NI imports + entries to the `Object.entries({...})` map in `src/server/router.js` (additive).
7. **Content** — NI copy in a new `src/config/ni-content.js` (keeps GB `content.js` untouched).

## Phase 2 — EUBR annotation component (the core mechanism)

Goal: build the reusable highlight + tooltip system once, so every later screen just wraps areas with one macro. Build and verify this before the journey screens.

1. **Macro** — `src/server/common/components/eubr-annotation/macro.njk` exporting `eubrAnnotation(key)` as a `{% call %}` macro. It looks up `eubr[key]` (the global) and renders a wrapper around `caller()`:
   ```njk
   {% call eubrAnnotation("registration") %} ...area markup... {% endcall %}
   ```
   The wrapper carries `data-eubr`, `data-eubr-articles`, `data-eubr-title`, `data-eubr-summary`, `data-eubr-applies-from`, `tabindex="0"`, and `aria-describedby` (wired to the tooltip element by JS). Favour clear attribute/class names over comments (per repo convention).
2. **SCSS** — `src/client/stylesheets/components/eubr-annotation/_eubr-annotation.scss`; register with `@use 'eubr-annotation/eubr-annotation';` in `components/_index.scss`. Defines: the outline shown only when `<body class="eubr-mode">`, a focus/hover state, and the tooltip bubble (positioned, high z‑index, GOV.UK colours, respects `prefers-reduced-motion`).
3. **Overlay JS** — `src/client/javascripts/ni/eubr/index.js` + `entry.js`:
   - toggle handler adds/removes `eubr-mode` on `<body>`; persist state in `sessionStorage` so it survives navigation across NI pages.
   - on hover **and** `focusin` of any `[data-eubr]`, build/position a tooltip from the element's data attributes (article number(s), title, one‑line summary, "Applies from" date); hide on `mouseleave`/`focusout`/`Esc`.
   - set `aria-describedby` so screen readers announce the tooltip; tooltip container has `role="tooltip"`.
   - guard everything so it is inert when no `[data-eubr]` elements exist.
4. **Webpack** — add entry `niEubr: './javascripts/ni/eubr/entry.js'` to `webpack.config.js` (additive). Loaded by `ni/_layout.njk`, so it applies to every NI page automatically.

**Checkpoint:** with only the dashboard built, run the app, toggle EUBR mode, confirm cards outline and tooltips appear on hover and on Tab/focus.

## Phase 3 — Onboarding / registration journey (mirrored GB screens, EUBR‑annotated)

Goal: a multi‑step NI registration flow modelled on the existing onboarding wizard, every step annotated.

- Folder `src/server/ni/onboarding/<step>/` per step, sharing a `ni/onboarding/_layout.njk` (mirror `common/templates/onboarding/_layout.njk`).
- Steps: company details, contact details, **battery categories** (`batteryCategories`), brand names, **producer route / EPR scheme** (`epr`), declaration (`reporting`/`informationEndUsers`), confirmation (issues an NI BPRN). Wrap each field group / panel in `eubrAnnotation(...)` with the matching key.
- State persistence: reuse the existing client‑side hydration/storage pattern (`hydrate-form.js`, `storage-adapter.js`) — point new per‑step entries at it; do not modify the shared files.
- Add a webpack entry per step (mirror existing onboarding entries).

## Phase 4 — EUBR‑specific screens (no GB equivalent)

Goal: the screens that make this an *EUBR* journey rather than a relabelled GB one. Each is a new step/section, heavily annotated.

1. **Carbon‑footprint declaration** (`carbonFootprint`, `recycledContent`) — declare CF value, performance class, recycled‑content shares.
2. **Battery passport & labelling** (`batteryPassport`, `labelling`, `removability`) — QR/passport data‑carrier, separate‑collection symbol, capacity marking, removability statement; render a sample QR placeholder.
3. **Due‑diligence policy** (`dueDiligenceScope`, `dueDiligence`) — €40m turnover gate then due‑diligence policy upload/attestation and third‑party verification.

These can sit as extra onboarding steps and/or dedicated dashboard sub‑journeys; surface them as their own dashboard cards so each maps cleanly to its article in the overlay.

## Phase 5 — Annual return / reporting journey

Goal: NI annual return mirroring the GB annual‑return shape, annotated for reporting + targets.

- Folder `src/server/ni/annualReturn/<step>/` with its own `_layout.njk`; steps for categories, tonnages placed on market, collection achieved, recycling efficiency, declaration, confirmation.
- Annotate with `reporting` (Arts 75–76), `collectionTargets` (Arts 59–61), `recyclingEfficiency` (Art 71 / Annex XII).
- Webpack entry per step.

## Phase 6 — Entry point, polish & verification

1. **Entry point** — add an NI card/link on the existing `/` home or `/about` page pointing to `/ni/sign-in`, clearly labelled "Northern Ireland producer (EU Batteries Regulation) — prototype". Single additive block; no change to existing home content.
2. **Content pass** — review every tooltip summary for accuracy against EUR‑Lex; ensure NI/Windsor‑Framework framing and "Applies from" dates are correct.
3. **Accessibility** — verify keyboard‑only operation of the toggle and tooltips, focus order, `aria-describedby`, `Esc` to dismiss, and reduced‑motion. Check tooltip contrast meets WCAG AA.
4. **Isolation check** — diff confirms GB journeys are byte‑unchanged except for the additive entries in `router.js`, `paths.js`, `webpack.config.js`, `globals.js`, `components/_index.scss`, and the home‑page link.

---

## Files created (new) and edited (additive only)

**New (representative):**
- `src/config/eubr.js`, `src/config/ni-content.js`
- `src/server/common/templates/ni/_layout.njk`, `.../ni/onboarding/_layout.njk`, `.../ni/annualReturn/_layout.njk`
- `src/server/common/components/eubr-annotation/macro.njk`
- `src/server/ni/{signIn,dashboard,onboarding/<step>,annualReturn/<step>}/{index,controller}.js` + `*.njk`
- `src/client/stylesheets/components/eubr-annotation/_eubr-annotation.scss`
- `src/client/javascripts/ni/eubr/{index,entry}.js` (+ per‑page entries mirroring existing ones)

**Edited (additive):**
- `src/server/router.js` — NI route registrations
- `src/config/paths.js` — `ni*` path constants
- `src/config/nunjucks/globals/globals.js` — export `eubrArticles`
- `webpack.config.js` — `niEubr` + per‑page entries
- `src/client/stylesheets/components/_index.scss` — `@use` the annotation partial
- `src/server/home/index.njk` (or `about`) — single entry link

---

## Verification

1. **Build & run:** `npm run dev` (hot reload). Visit `/ni/sign-in` → `/ni/dashboard`; walk the full journey end‑to‑end (onboarding → EUBR‑specific screens → annual return → confirmation).
2. **Overlay:** toggle "EUBR mode" on the dashboard — every annotated area gains an outline; hovering and Tab‑focusing each area shows a tooltip with the correct article number(s), title, summary and "Applies from" date. Toggle state persists across NI pages, `Esc` dismisses a tooltip.
3. **Mapping accuracy:** spot‑check ~3 tooltips against the EUR‑Lex consolidated text.
4. **Accessibility:** keyboard‑only pass (no mouse) of toggle + tooltips; screen‑reader announces tooltip via `aria-describedby`.
5. **No regressions:** existing GB journeys (`/dashboard`, `/onboarding/*`, `/annual-return/*`, regulator/operator/scheme views) look and behave exactly as before; `git diff` on shared files shows only additive lines. Run `npm test` and `npm run lint` — both pass (lint clean, no `any` casts, no code comments per repo conventions).

---

## Sources

- [Regulation (EU) 2023/1542 — EUR-Lex (consolidated text)](https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng)
- [DAERA NI — Implementation of the EU Batteries Regulation](https://www.daera-ni.gov.uk/articles/batteries-implementation-eu-batteries-regulation)
- [EUR-Lex summary — Sustainability rules for batteries and waste batteries](https://eur-lex.europa.eu/EN/legal-content/summary/sustainability-rules-for-batteries-and-waste-batteries.html)
