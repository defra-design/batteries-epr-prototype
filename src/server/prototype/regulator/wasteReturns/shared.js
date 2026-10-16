import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../config/paths.js'
import { PROTOTYPE_REGULATOR_SERVICE_NAME } from '../../../../config/prototype-regulator-content.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../config/prototype-regulator-waste-returns-content.js'
import { CATEGORIES, SMALL_OPERATOR_THRESHOLD_TONNES } from './data.js'
import { getAbtos, getSubmissions } from './store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

const content = prototypeRegulatorWasteReturnsContent

// An authenticated account area, not a task flow: every screen keeps the
// header and service navigation. "Reset data" is a real, live link because
// decisions persist in a shared server-side store for the life of the process.
const buildNavigation = (currentPath) => [
  {
    text: 'Home',
    href: paths.prototypeRegulatorWasteReturnsHome,
    current: currentPath === paths.prototypeRegulatorWasteReturnsHome
  },
  { text: 'Manage account', href: '#' },
  { text: 'My profile', href: '#' },
  { text: 'Reset data', href: paths.devReset },
  { text: 'Sign out', href: '#' }
]

// Only Waste returns and Flags are built; the other tabs stay dead (href="#").
export const buildTabs = (currentKey) =>
  [
    {
      key: 'wasteReturns',
      text: content.tabs.wasteReturns,
      href: paths.prototypeRegulatorWasteReturnsHome
    },
    { key: 'abtos', text: content.tabs.abtos, href: '#' },
    { key: 'schemes', text: content.tabs.schemes, href: '#' },
    { key: 'reports', text: content.tabs.reports, href: '#' },
    {
      key: 'flags',
      text: content.tabs.flags,
      href: paths.prototypeRegulatorWasteReturnsFlags
    }
  ].map((tab) => ({ ...tab, current: tab.key === currentKey }))

export const basePageModel = (pageContent, currentPath) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading ?? pageContent.title,
  labels: pageContent,
  serviceName: PROTOTYPE_REGULATOR_SERVICE_NAME,
  navigation: buildNavigation(currentPath)
})

export const fillTemplate = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )

export const formatTonnes = (tonnes) =>
  tonnes.toLocaleString('en-GB', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })

export const formatDateOnly = (isoString) =>
  format(parseISO(isoString), 'd MMM yyyy')

export const formatLongDateTime = (isoString) =>
  format(parseISO(isoString), 'd MMMM yyyy, h:mmaaa')

export const getSchemes = () => seedData.prototypeRegulatorSchemes

export const findScheme = (schemeId) =>
  getSchemes().find((scheme) => scheme.id === schemeId) ?? null

export const findAbto = (abtoId) =>
  getAbtos().find((abto) => abto.id === abtoId) ?? null

export const submissionsForScheme = (schemeId) =>
  getSubmissions().filter((submission) => submission.schemeId === schemeId)

export const submissionsForSchemeAbto = (schemeId, abtoId) =>
  submissionsForScheme(schemeId).filter(
    (submission) => submission.abtoId === abtoId
  )

export const findSubmission = (schemeId, abtoId, siteId) =>
  getSubmissions().find(
    (submission) =>
      submission.schemeId === schemeId &&
      submission.abtoId === abtoId &&
      submission.siteId === siteId
  ) ?? null

export const siteLabel = (abto, site) => `${abto.name} (${site.name})`

// Loads the scheme, operator, site and return named in the URL, or 404s —
// a return only exists for a site that treated that scheme's batteries.
export const loadReturn = ({ schemeId, abtoId, siteId }) => {
  const scheme = findScheme(schemeId)
  const abto = findAbto(abtoId)
  const site = abto?.sites.find((candidate) => candidate.id === siteId)
  const submission = site ? findSubmission(schemeId, abtoId, siteId) : null

  if (!scheme || !abto || !site || !submission) {
    throw Boom.notFound()
  }

  return { scheme, abto, site, submission }
}

export const returnParams = ({ schemeId, abtoId, siteId }) => ({
  schemeId,
  abtoId,
  siteId
})

export const reviewHref = (params) =>
  pathTo(paths.prototypeRegulatorWasteReturnsReview, returnParams(params))

export const sumFigures = (figures) =>
  Object.values(figures).reduce((total, tonnes) => total + tonnes, 0)

// One row per category with intake against BEN evidence and whether they match.
export const reconciliationRows = (submission) =>
  CATEGORIES.map(({ id, label }) => ({
    id,
    label,
    intakeTonnes: submission.intake[id],
    bensTonnes: submission.bens[id],
    matches: submission.intake[id] === submission.bens[id]
  }))

export const categoryLabels = (categoryIds) =>
  CATEGORIES.filter(({ id }) => categoryIds.includes(id)).map(
    ({ label }) => label
  )

export const joinWithAnd = (items) =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
    : items[0]

// An operator's overall status for a scheme: anything needing the
// regulator's attention wins over settled returns.
const STATUS_PRECEDENCE = ['awaitingReview', 'querySent', 'overdue', 'accepted']

export const overallStatus = (submissions) =>
  STATUS_PRECEDENCE.find((status) =>
    submissions.some((submission) => submission.status === status)
  )

export const latestSubmittedOn = (submissions) =>
  submissions
    .map((submission) => submission.submittedOn)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

export const isOverThreshold = (abto) =>
  abto.classification === 'small' &&
  abto.bensIssuedThisYear > SMALL_OPERATOR_THRESHOLD_TONNES

export const thresholdStatusKey = (abto) => {
  if (isOverThreshold(abto)) {
    return 'exceeded'
  }
  return abto.reclassification ? 'reclassified' : null
}

export const THRESHOLD_STATUS_COLOURS = {
  exceeded: 'orange',
  reclassified: 'green'
}

// The grey panel of operator facts shown at the top of every ABTO account
// and reclassification screen.
export const abtoFacts = (abto, labels) => {
  const status = thresholdStatusKey(abto)
  const content = prototypeRegulatorWasteReturnsContent.abtoAccount

  return [
    {
      label: labels.approvalNumber,
      value: abto.sites[0].approvalNumber
    },
    {
      label: labels.classification,
      value: content.classifications[abto.classification]
    },
    {
      label: labels.bens,
      value: `${formatTonnes(abto.bensIssuedThisYear)} tonnes`
    },
    status
      ? {
          label: labels.thresholdStatus,
          tag: {
            text: content.thresholdStatuses[status],
            colour: THRESHOLD_STATUS_COLOURS[status]
          }
        }
      : { label: labels.thresholdStatus, value: '–' }
  ]
}

export const loadAbto = ({ abtoId }) => {
  const abto = findAbto(abtoId)

  if (!abto) {
    throw Boom.notFound()
  }

  return abto
}
