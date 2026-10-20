import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { basePageModel, flagCountFor, schemeHomeHref } from '../shared.js'
import { getQueriedRecords, getSubmissions } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// Tags take Design System colours by meaning: blue is informational (waiting
// for the regulator), orange is waiting on someone else, green is done, red is
// a problem, grey is nothing yet.
const STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  rejected: 'red',
  notYetSubmitted: 'grey',
  overdue: 'red'
}

const TAB_ORDER = ['received', 'queried', 'accepted', 'rejected', 'overdue']

const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key])

const buildYears = ({ first, last }, selectedYear) =>
  Array.from({ length: last - first + 1 }, (_, i) => last - i).map((year) => ({
    value: String(year),
    text: String(year),
    selected: String(year) === String(selectedYear)
  }))

const buildReturns = (pageContent, year, quarter) => {
  const schemesById = new Map(
    seedData.prototypeRegulatorSchemes.map((scheme) => [scheme.id, scheme])
  )

  return getSubmissions()
    .filter(
      (submission) =>
        submission.compliancePeriodYear === String(year) &&
        submission.quarter === quarter
    )
    .map((submission) => ({
      schemeId: submission.schemeId,
      schemeName: schemesById.get(submission.schemeId).name,
      status: submission.status,
      membersCount: submission.membersCount,
      submittedOn: submission.submittedOn,
      statusLabel: pageContent.statusLabels[submission.status],
      statusColour: STATUS_TAG_COLOUR[submission.status],
      flags: flagCountFor(submission),
      viewHref: schemeHomeHref(submission.schemeId)
    }))
}

const SORTS = {
  submitted: (a, b) => a.submittedOn.localeCompare(b.submittedOn),
  status: (a, b) => a.statusLabel.localeCompare(b.statusLabel)
}

// Newest submitted first by default; `?sort=submitted|status&order=asc|desc`.
const sortReturns = (returns, sort, order) => {
  const compare = SORTS[sort] ?? SORTS.submitted
  const direction = (sort ? order : 'desc') === 'asc' ? 1 : -1
  return [...returns].sort((a, b) => direction * compare(a, b))
}

const buildHeadings = (pageContent, sort, order) => {
  const active = SORTS[sort] ? sort : 'submitted'
  const activeOrder = (sort ? order : 'desc') === 'asc' ? 'asc' : 'desc'
  const heading = (key, text) => ({
    key,
    text,
    ariaSort:
      active === key
        ? activeOrder === 'asc'
          ? 'ascending'
          : 'descending'
        : 'none',
    href: `?sort=${key}&order=${active === key && activeOrder === 'desc' ? 'asc' : 'desc'}`
  })
  return {
    submitted: heading('submitted', pageContent.columns.submitted),
    status: heading('status', pageContent.columns.status)
  }
}

export const dashboardController = {
  handler(request, h) {
    const pageContent = prototypeRegulatorContent.dashboard
    const year = request.query.year ?? pageContent.year.last
    const quarter = 'Q2'
    const values = { year, quarter: quarter.slice(1) }

    const returns = sortReturns(
      buildReturns(pageContent, year, quarter),
      request.query.sort,
      request.query.order
    )
    const count = (status) =>
      returns.filter((entry) => entry.status === status).length
    const toReview = returns.filter((entry) => entry.status === 'received')
    const queried = getQueriedRecords().filter(
      (record) =>
        record.compliancePeriodYear === String(year) &&
        record.quarter === quarter
    )
    const countRecords = (status) =>
      queried.filter((record) => record.status === status).length

    const tabs = [
      { key: 'all', label: pageContent.allTab, returns },
      ...TAB_ORDER.map((status) => ({
        key: status,
        label: pageContent.statusLabels[status],
        returns: returns.filter((entry) => entry.status === status)
      })).filter((tab) => tab.returns.length > 0)
    ]

    return h.view('prototype/regulator/pomSubmission/dashboard/view', {
      ...basePageModel(pageContent, {
        breadcrumbs: [
          { text: 'NPWD', href: paths.prototypeRegulatorHome },
          { text: pageContent.heading }
        ]
      }),
      quickLinkItems: Object.entries(pageContent.quickLinks.links).map(
        ([key, text]) => ({ key, text, href: '#' })
      ),
      years: buildYears(pageContent.year, year),
      action: paths.prototypeRegulatorPomSubmissionDashboard,
      tasksHeading: fill(pageContent.tasksHeading, values),
      taskCards: [
        {
          key: 'toReview',
          label: pageContent.tasks.toReview.label,
          count: toReview.length,
          link: toReview[0]
            ? fill(pageContent.tasks.toReview.link, {
                scheme: toReview[0].schemeName
              })
            : null,
          href: toReview[0]?.viewHref ?? '#'
        },
        {
          key: 'overdue',
          label: pageContent.tasks.overdue.label,
          count: count('overdue'),
          link: pageContent.tasks.overdue.link,
          href: '#'
        },
        {
          key: 'newResponses',
          label: pageContent.tasks.newResponses.label,
          count: countRecords('responded'),
          link: pageContent.tasks.newResponses.link,
          href: '#'
        },
        {
          key: 'openQueries',
          label: pageContent.tasks.openQueries.label,
          count: countRecords('awaiting'),
          link: pageContent.tasks.openQueries.link,
          href: '#'
        }
      ],
      returnsHeading: fill(pageContent.returnsHeading, values),
      noReturns: fill(pageContent.noReturns, values),
      headings: buildHeadings(
        pageContent,
        request.query.sort,
        request.query.order
      ),
      tabs
    })
  }
}
