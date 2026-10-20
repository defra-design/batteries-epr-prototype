import { format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../config/paths.js'
import { regulatorPageModel } from '../layout.js'
import { getFlags, getSubmissions } from './store.js'

// Every scheme has a home screen (schemeId-parameterised), but only these
// schemes have real, populated homes in this batch — every other scheme's
// "View" link stays dead (href="#") until its home is built.
export const SCHEMES_WITH_HOME_BUILT = new Set([
  'ironwave-compliance',
  'repic',
  'copper-and-co-compliance'
])

// The scheme record screen is built for IronWave Compliance and REPIC.
export const SCHEMES_WITH_RECORD_BUILT = new Set([
  'ironwave-compliance',
  'repic'
])

// Of the schemes with a home, only these have their scheme record, members
// and submissions screens populated — the others' homes render but their
// quick links to those screens stay dead.
export const SCHEMES_WITH_DETAIL_SCREENS_BUILT = new Set([
  'ironwave-compliance'
])

export const submissionsFor = (schemeId) =>
  getSubmissions().filter((s) => s.schemeId === schemeId)

export const latestSubmissionFor = (schemeId) =>
  submissionsFor(schemeId)
    .sort((a, b) => a.submittedOn.localeCompare(b.submittedOn))
    .at(-1)

export const findSubmission = (schemeId, year, quarter) =>
  getSubmissions().find(
    (s) =>
      s.schemeId === schemeId &&
      s.compliancePeriodYear === year &&
      s.quarter === quarter
  ) ?? null

// Every PoM screen is on the shared regulator layout (layouts/regulator.njk)
// with PoM submissions as the current nav item. Pass `backLink`, `breadcrumbs`
// and `headingTag` for the hero.
export const basePageModel = (pageContent, options = {}) =>
  regulatorPageModel(pageContent, { currentNav: 'pomSubmissions', ...options })

export const schemeHomeHref = (schemeId) =>
  SCHEMES_WITH_HOME_BUILT.has(schemeId)
    ? pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId })
    : '#'

// "{name}" placeholders in content strings.
export const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key])

export const formatDateOnly = (isoString) =>
  /* v8 ignore next */
  isoString ? format(parseISO(isoString), 'd MMMM yyyy') : null

export const formatDateTime = (isoString) =>
  /* v8 ignore next */
  isoString ? format(parseISO(isoString), 'd MMMM yyyy, HH:mm') : null

// The Agency officer recording the decision. This prototype has no real
// sign-in/session identity, so the scheme's assigned account manager stands
// in for "whoever is signed in as the regulator".
export const decidedByFor = (scheme) =>
  `${scheme.accountManager}, Environment Agency`

// Carries the reason the regulator already typed on the review screen
// forward to the reject-confirm screen's prefilled textarea (read-once,
// via the session flash — the same mechanism the registration journey uses
// to carry re-entered form values across a redirect).
export const rejectReasonFlashKey = (schemeId, year, quarter) =>
  `prototypeRegulatorRejectReason:${schemeId}:${year}:${quarter}`

// "Copper & Co Ltd" and "Copper & Co" are the same member: figures and queries
// use the short form.
export const normaliseMemberName = (name) =>
  name
    .replace(/\s+(Ltd|Limited)$/i, '')
    .trim()
    .toLowerCase()

export const flagsFor = (schemeId, year, quarter) =>
  getFlags().filter(
    (flag) =>
      flag.schemeId === schemeId &&
      flag.compliancePeriodYear === year &&
      flag.quarter === quarter
  )

// The number of figures flagged: the flags themselves where they exist, else
// the count recorded on the submission.
export const flagCountFor = (submission) => {
  const flags = flagsFor(
    submission.schemeId,
    submission.compliancePeriodYear,
    submission.quarter
  )
  return flags.length > 0 ? flags.length : submission.issuesFound
}

// Tonnes to three decimal places, as the figures are shown on every screen.
export const formatTonnes3 = (tonnes) =>
  tonnes.toLocaleString('en-GB', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })

export const formatSigned = (tonnes) =>
  `${tonnes < 0 ? '−' : '+'}${formatTonnes3(Math.abs(tonnes))} t`

// The next quarter's label: Q2 2026 → Q3 2026, Q4 2025 → Q1 2026.
export const nextPeriodLabel = (quarter, year) => {
  const number = Number(quarter.slice(1))
  return number === 4 ? `Q1 ${Number(year) + 1}` : `Q${number + 1} ${year}`
}
