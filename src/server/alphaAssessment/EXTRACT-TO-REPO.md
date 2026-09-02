# Prompt: extract the alpha assessment presentation into its own repo

This document is a self-contained prompt for a future Claude Code session. Its job: move the
`/alpha-assessment` static site out of `batteries-epr-prototype` and into its own repository,
published the same way as the site it was copied from.

## Background

The site under `src/server/alphaAssessment/pages/` is an interactive presentation of the
Batteries EPR project for the GDS alpha assessment team. It was built by copying the ten pages
of Defra's Green List Waste discovery readout (https://defra.github.io/green-list-waste-discovery/,
GitHub Pages, StatiCrypt-protected, password `greenlistwaste`), then:

- re-theming the green/parchment palette to blue/navy via `tools/retheme.mjs` (kept at the repo
  root; it holds the full green→blue colour mapping and is idempotent-safe to re-run only on
  un-themed template copies, not on already-themed pages)
- replacing the animated recycling-plant hero SVG in `index.html` (`PLANT_SVG`) with a battery
  take-back scene, reusing the template's animation classes (`.plant-line`, `.belt-move`,
  `.item-1…6`, `.scanline`, `.fillbar`) so the CSS keyframes and `prefers-reduced-motion`
  fallback carried over
- renaming the chrome (page `<title>`s, the `at-title` toolbar spans, and the `site.json` values
  embedded in `index.html`'s `window.__GLW_CONTENT__`) to Batteries EPR

Each page is fully self-contained (inline CSS/JS, no external assets), so the pages work from
any static host. The pages are temporarily served by the prototype because it already has a
password gate and a deploy.

## Task

1. Create the new repo (agree the name and org with the user — the template lives at
   `defra/green-list-waste-discovery`; this prototype is under `defra-design`). Shape it like
   the template: the ten `*.html` files flat at the repo root, no build step.
2. Move `src/server/alphaAssessment/pages/*.html` there, and bring `tools/retheme.mjs` along
   (e.g. under `tools/`) with a note in the new README recording the provenance and the colour
   mapping.
3. Add StatiCrypt protection as the publishing step, exactly as the template does — every page
   individually encrypted, one password for the site. Ask the user for the password, then:
   `npx staticrypt *.html -d . --password <password> --remember 30`
   (encrypt into a publish directory or branch rather than overwriting the plain sources —
   decide with the user whether plain sources stay in the repo or the repo stays private).
4. Enable GitHub Pages on the encrypted output.
5. Remove the site from `batteries-epr-prototype`:
   - `src/server/alphaAssessment/` (route module, test, pages, this file)
   - the `alphaAssessment` entries in `src/config/paths.js` and `src/server/router.js`
   - the landing card: `src/server/landing/index.njk` (the `landing-area-alpha-assessment`
     card), `src/server/landing/controller.js` (`alphaAssessmentUrl`), the
     `landing.areas.alphaAssessment` blocks (en and cy) in `src/config/content.js`, and the
     related assertions in `src/server/landing/controller.test.js`
   - the `/alpha-assessment` entry in `README.md` (optionally replace it with a link to the
     new published site)
   - `tools/retheme.mjs` once it has moved

## Verify

- Every page of the published site decrypts with the chosen password, including deep links
  straight to a sub-page.
- Inter-page links (they are relative: `alpha-plan.html` etc.) resolve at the new root, and
  the rail nav on `index.html` still works.
- The hero battery animation runs, and is static under `prefers-reduced-motion`.
- Back in the prototype: `pnpm git:pre-commit-hook` passes (format, lint, tests at 100%
  coverage) after the removal, and `/` no longer shows the presentation card.
