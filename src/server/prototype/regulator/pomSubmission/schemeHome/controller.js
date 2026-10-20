import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { differenceInCalendarDays, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  flagCountFor,
  formatDateOnly,
  formatDateTime,
  latestSubmissionFor,
  nextPeriodLabel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  SCHEMES_WITH_HOME_BUILT,
  SCHEMES_WITH_RECORD_BUILT
} from '../shared.js'
import { getFailedUploads, getQueriedRecords } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// Design System tag colours by meaning: blue is waiting on the regulator,
// orange is waiting on the scheme, green is done, red is a problem.
const STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  rejected: 'red',
  notYetSubmitted: 'grey'
}

const PERIOD_RANGE = {
  Q1: '1 Jan – 31 Mar',
  Q2: '1 Apr – 30 Jun',
  Q3: '1 Jul – 30 Sep',
  Q4: '1 Oct – 31 Dec'
}

const linkTo = (built, pathTemplate, schemeId) =>
  built ? pathTo(pathTemplate, { schemeId }) : '#'

const submissionPath = (pathTemplate, schemeId, submission) =>
  pathTo(pathTemplate, {
    schemeId,
    year: submission.compliancePeriodYear,
    quarter: submission.quarter
  })

const buildDetailRows = (labels, scheme, submission, schemeId, membersHref) => [
  {
    key: { text: labels.approvalNumberLabel },
    value: { text: scheme.approvalNumber }
  },
  {
    key: { text: labels.approvedLabel },
    value: { text: formatDateOnly(scheme.approvedOn) }
  },
  {
    key: { text: labels.membersLabel },
    value: { text: String(submission.membersCount) },
    actions:
      membersHref === '#'
        ? undefined
        : {
            items: [
              {
                href: membersHref,
                text: labels.seeAllMembers,
                visuallyHiddenText: ' — members'
              }
            ]
          }
  },
  {
    key: { text: labels.authorisedSignatoryLabel },
    value: { text: scheme.authorisedSignatory.name }
  },
  {
    key: { text: labels.superUserLabel },
    value: { text: scheme.superUser.name }
  }
]

const failedUploadsFor = (schemeId, year) =>
  getFailedUploads().filter(
    (upload) =>
      upload.schemeId === schemeId && upload.compliancePeriodYear === year
  )

const buildReceived = (labels, scheme, submission, schemeId, hrefs) => {
  const failed = failedUploadsFor(schemeId, submission.compliancePeriodYear)
  const byQuarter = failed
    .map((upload) => upload.quarter)
    .reduce(
      (counts, quarter) => ({
        ...counts,
        [quarter]: (counts[quarter] ?? 0) + 1
      }),
      {}
    )
  const evidenceCount = submission.supportingEvidenceCount ?? 1
  const values = {
    submittedOn: formatDateOnly(submission.submittedOn),
    filesCount: submission.filesCount,
    evidenceCount,
    members: submission.membersCount,
    flags: flagCountFor(submission)
  }
  const daysLate = differenceInCalendarDays(
    parseISO(submission.submittedOn),
    parseISO(submission.deadlineOn)
  )
  const deadlineValues = {
    deadline: formatDateOnly(submission.deadlineOn),
    daysLate,
    lockOn: formatDateOnly(submission.lockOn),
    quarter: submission.quarter,
    nextPeriod: nextPeriodLabel(
      submission.quarter,
      submission.compliancePeriodYear
    )
  }

  return {
    intro: fill(labels.intro.received, values),
    deadline: fill(
      daysLate > 0 ? labels.deadline : labels.deadlineOnTime,
      deadlineValues
    ),
    taskList: {
      heading: labels.statusHeading,
      items: [
        {
          title: { text: labels.tasks.submitted.title },
          hint: { text: formatDateTime(submission.submittedOn) },
          status: {
            tag: {
              text: labels.tasks.submitted.status,
              classes: 'govuk-tag--green'
            }
          }
        },
        {
          title: { text: labels.tasks.checks.title },
          hint: { text: formatDateTime(submission.automatedChecksPassedOn) },
          status: {
            tag: {
              text: labels.tasks.checks.status,
              classes: 'govuk-tag--green'
            }
          }
        },
        {
          title: { text: labels.tasks.review.title },
          href: hrefs.review,
          status: {
            tag: {
              text: labels.tasks.review.status,
              classes: 'govuk-tag--blue'
            }
          }
        },
        {
          title: { text: labels.tasks.decision.title },
          status: {
            text: labels.tasks.decision.status,
            classes: 'govuk-task-list__status--cannot-start-yet'
          }
        }
      ]
    },
    summary: [
      [labels.summary.scheme, scheme.name],
      [
        labels.summary.period,
        `${submission.periodLabel} (${PERIOD_RANGE[submission.quarter]})`
      ],
      [labels.summary.files, fill(labels.filesValue, values)],
      [labels.summary.validation, fill(labels.validationValue, values)],
      failed.length > 0 && [
        fill(labels.summary.failedValidation, {
          year: submission.compliancePeriodYear
        }),
        fill(labels.failedValidationValue, {
          count: failed.length,
          byQuarter: Object.entries(byQuarter)
            .map(([quarter, count]) => `${quarter} (${count})`)
            .join(', ')
        }),
        { href: hrefs.failedValidation, text: labels.viewAll }
      ],
      [labels.summary.submittedBy, `${submission.submittedBy}, Super User`],
      [labels.summary.submitted, formatDateTime(submission.submittedOn)]
    ].filter(Boolean),
    links: [
      {
        text: fill(labels.viewFilesLink, {
          count: submission.filesCount + evidenceCount
        }),
        href: hrefs.files
      },
      { text: labels.viewHistoryLink, href: hrefs.history }
    ],
    button: { text: labels.reviewAction, href: hrefs.runDataChecks }
  }
}

const buildQueried = (labels, scheme, submission, hrefs) => {
  const queried = getQueriedRecords().filter(
    (record) =>
      record.schemeId === scheme.id &&
      record.compliancePeriodYear === submission.compliancePeriodYear &&
      record.quarter === submission.quarter
  )
  const answered = queried.filter((record) => record.status === 'responded')
  const total = submission.recordsCount
  const values = {
    scheme: scheme.name,
    queried: queried.length,
    queriedOn: formatDateOnly(queried[0]?.queriedOn),
    others: total - queried.length
  }

  return {
    intro: fill(labels.intro.queried, values),
    summary: [
      [labels.summary.scheme, scheme.name],
      [
        labels.summary.period,
        `${submission.periodLabel} (${PERIOD_RANGE[submission.quarter]})`
      ],
      [labels.summary.files, fill(labels.filesValueSimple, submission)],
      [labels.summary.submittedBy, submission.submittedBy],
      [labels.summary.submitted, formatDateTime(submission.submittedOn)],
      [labels.summary.recordsQueried, `${queried.length} of ${total}`],
      [labels.summary.responseDue, formatDateOnly(submission.responseDueOn)]
    ],
    links: [
      {
        text: fill(labels.viewQueriedLink, { count: queried.length }),
        href: hrefs.queriedRecords
      },
      {
        text: fill(labels.viewFilesLinkSimple, {
          count: submission.filesCount
        }),
        href: hrefs.files
      },
      { text: labels.viewHistoryLink, href: hrefs.history }
    ],
    button:
      answered.length > 0
        ? { text: labels.reviewAnsweredAction, href: hrefs.queriedRecords }
        : null
  }
}

const buildDecided = (labels, scheme, submission, hrefs, outcome) => ({
  intro: fill(labels.intro[outcome], {
    scheme: `${scheme.name}'s ${submission.periodLabel}`,
    decidedOn: formatDateOnly(submission.decidedOn)
  }),
  summary: [
    [labels.summary.scheme, scheme.name],
    [
      labels.summary.period,
      `${submission.periodLabel} (${PERIOD_RANGE[submission.quarter]})`
    ],
    [labels.summary.files, fill(labels.filesValueSimple, submission)],
    [labels.summary.submitted, formatDateTime(submission.submittedOn)],
    [labels.summary.decided, formatDateOnly(submission.decidedOn)]
  ],
  links: [
    {
      text: fill(labels.viewFilesLinkSimple, { count: submission.filesCount }),
      href: hrefs.files
    },
    { text: labels.viewHistoryLink, href: hrefs.history }
  ],
  button: null
})

export const schemeHomeController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_HOME_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.schemeHome
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submission = latestSubmissionFor(schemeId)
    const detailsBuilt = SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)
    const submissionScreens = (template) =>
      detailsBuilt ? submissionPath(template, schemeId, submission) : '#'

    const hrefs = {
      review: submissionPath(
        paths.prototypeRegulatorPomSubmissionRunningDataChecks,
        schemeId,
        submission
      ),
      runDataChecks: submissionPath(
        paths.prototypeRegulatorPomSubmissionRunningDataChecks,
        schemeId,
        submission
      ),
      files: submissionScreens(
        paths.prototypeRegulatorPomSubmissionSubmissionFiles
      ),
      history: '#',
      queriedRecords: '#',
      failedValidation: '#'
    }
    const membersHref = linkTo(
      detailsBuilt,
      paths.prototypeRegulatorPomSubmissionSchemeMembers,
      schemeId
    )

    let submissionSection
    switch (submission.status) {
      case 'received':
        submissionSection = buildReceived(
          labels,
          scheme,
          submission,
          schemeId,
          hrefs
        )
        break
      case 'queried':
        submissionSection = buildQueried(labels, scheme, submission, hrefs)
        break
      default:
        submissionSection = buildDecided(
          labels,
          scheme,
          submission,
          hrefs,
          submission.status === 'rejected' ? 'rejected' : 'accepted'
        )
    }

    const summaryRows = (rows) =>
      rows.map(([key, value, action]) => ({
        key: { text: key },
        value: { text: value },
        actions: action
          ? {
              items: [
                {
                  href: action.href,
                  text: action.text,
                  visuallyHiddenText: ` — ${key}`
                }
              ]
            }
          : undefined
      }))

    return h.view('prototype/regulator/pomSubmission/schemeHome/view', {
      ...basePageModel(
        {
          ...labels,
          title: scheme.name,
          heading: scheme.name,
          intro: scheme.npwdRef
        },
        {
          backLink: {
            href: paths.prototypeRegulatorPomSubmissionDashboard,
            text: labels.backLink
          },
          headingTag: {
            text: labels.statusLabels[submission.status],
            colour: STATUS_TAG_COLOUR[submission.status]
          }
        }
      ),
      scheme,
      detailRows: buildDetailRows(
        labels,
        scheme,
        submission,
        schemeId,
        membersHref
      ),
      quickLinks: [
        {
          key: 'record',
          text: labels.quickLinks.record,
          href: linkTo(
            SCHEMES_WITH_RECORD_BUILT.has(schemeId),
            paths.prototypeRegulatorPomSubmissionSchemeRecord,
            schemeId
          )
        },
        { key: 'members', text: labels.quickLinks.members, href: membersHref },
        {
          key: 'submissions',
          text: labels.quickLinks.submissions,
          href: linkTo(
            detailsBuilt,
            paths.prototypeRegulatorPomSubmissionSchemeSubmissions,
            schemeId
          )
        }
      ],
      submissionHeading: fill(labels.submissionHeading, {
        period: submission.periodLabel
      }),
      status: {
        text: labels.statusLabels[submission.status],
        colour: STATUS_TAG_COLOUR[submission.status]
      },
      section: {
        ...submissionSection,
        summaryRows: summaryRows(submissionSection.summary)
      }
    })
  }
}
