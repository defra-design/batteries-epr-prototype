import { differenceInCalendarDays, format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../config/paths.js'
import { PROTOTYPE_REGULATOR_SERVICE_NAME } from '../../../../config/prototype-regulator-content.js'
import { getSubmissions } from './store.js'

// Every scheme has a home screen (schemeId-parameterised), but only these
// schemes have real, populated homes in this batch — every other scheme's
// "View" link stays dead (href="#") until its home is built.
export const SCHEMES_WITH_HOME_BUILT = new Set(['ironwave-compliance', 'repic'])

// Of the schemes with a home, only these have their scheme record, members
// and submissions screens populated — the others' homes render but their
// quick links to those screens stay dead.
export const SCHEMES_WITH_DETAIL_SCREENS_BUILT = new Set([
  'ironwave-compliance'
])

// This is an authenticated account area, not a task flow: every screen keeps
// the header and service navigation, unlike the compliance scheme submission
// journey's "before you start" onward task-flow screens.
const buildNavigation = (currentPath) => [
  {
    text: 'Home',
    href: paths.prototypeRegulatorPomSubmissionDashboard,
    current: currentPath === paths.prototypeRegulatorPomSubmissionDashboard
  },
  { text: 'Manage account', href: '#' },
  { text: 'My profile', href: '#' },
  { text: 'Sign out', href: '#' }
]

// Matches the Figma filenames, e.g. "IronWaveCompliance_Q2_2026.csv"
export const filenameFor = (scheme, submission) =>
  `${scheme.name.replace(/\s+/g, '').replace(/&/g, '')}_${submission.quarter}_${submission.compliancePeriodYear}.csv`

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

export const basePageModel = (pageContent, currentPath) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_REGULATOR_SERVICE_NAME,
  navigation: buildNavigation(currentPath)
})

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

export const buildLockInfo = (submission) => {
  if (!submission.lockOn) {
    return { lockTagText: null, lockWarning: null }
  }
  const lockInDays = differenceInCalendarDays(
    parseISO(submission.lockOn),
    new Date()
  )
  return {
    lockTagText: `Locks in ${lockInDays} days`,
    lockWarning: `${submission.periodLabel} figures lock on ${formatDateOnly(submission.lockOn)} — 2 months after the ${formatDateOnly(submission.deadlineOn)} deadline. After that, changes need a formal adjustment.`
  }
}

// Carries the reason the regulator already typed on the review screen
// forward to the reject-confirm screen's prefilled textarea (read-once,
// via the session flash — the same mechanism the registration journey uses
// to carry re-entered form values across a redirect).
export const rejectReasonFlashKey = (schemeId, year, quarter) =>
  `prototypeRegulatorRejectReason:${schemeId}:${year}:${quarter}`

// Only the first two of these are wired to a real destination (the two
// battery sales data submission tabs); the rest stay dead until those
// screens exist. Reused by the review screen (all 8) and the accept/query
// outcome screens (first 3, matching what Figma shows on those screens).
export const relatedLinksFor = (pageContent, schemeId) =>
  pageContent.relatedLinks.map((link) => ({
    text: link.text,
    href: link.fragment
      ? `${pathTo(paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission, { schemeId })}#${link.fragment}`
      : '#'
  }))
