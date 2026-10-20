import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import {
  differenceInCalendarDays,
  endOfMonth,
  addMonths,
  format,
  parseISO
} from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  decidedByFor,
  fill,
  findSubmission,
  formatDateOnly,
  formatTonnes3,
  nextPeriodLabel,
  normaliseMemberName,
  rejectReasonFlashKey,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import {
  formatRespondBy,
  readRespondBy,
  respondByFields
} from '../reviewShared.js'
import {
  getDraftQueries,
  getMemberFigures,
  getProducerFigures,
  getQueriedRecords,
  sendDraftQueries,
  updateSubmission
} from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const REASON_MAX_LENGTH = 1000
const view = 'prototype/regulator/pomSubmission/reviewPomReturn/view'

const reviewPath = ({ schemeId, year, quarter }) =>
  pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
    schemeId,
    year,
    quarter
  })

// Q1–Q3 lock two months after the quarter's deadline (end of that month).
const lockDateFor = (submission) =>
  endOfMonth(addMonths(parseISO(submission.deadlineOn), 2))

const whole = (tonnes) => tonnes.toLocaleString('en-GB')

const figuresFor = (submission) =>
  getProducerFigures().filter(
    (figure) =>
      figure.schemeId === submission.schemeId &&
      figure.compliancePeriodYear === submission.compliancePeriodYear &&
      figure.quarter === submission.quarter
  )

const draftsFor = (submission) =>
  getDraftQueries().filter(
    (draft) =>
      draft.schemeId === submission.schemeId &&
      draft.compliancePeriodYear === submission.compliancePeriodYear &&
      draft.quarter === submission.quarter
  )

const sentQueriesFor = (submission) =>
  getQueriedRecords().filter(
    (record) =>
      record.schemeId === submission.schemeId &&
      record.compliancePeriodYear === submission.compliancePeriodYear &&
      record.quarter === submission.quarter
  )

const buildSummary = (labels, scheme, submission, drafts, sent) => {
  const copy = labels.summary
  const figures = figuresFor(submission)
  const total = figures.reduce((sum, figure) => sum + figure.figureTonnes, 0)
  const obligation = seedData.prototypeRegulatorIndicativeObligation.find(
    (entry) => entry.schemeId === submission.schemeId
  )
  const remaining =
    obligation.indicativeObligationTonnes - obligation.evidenceAcquiredTonnes
  const row = (key, value) => ({ key: { text: key }, value: { text: value } })
  const assessedBy = () =>
    fill(labels.assessedByValue, {
      name: (submission.decidedBy ?? '').split(',')[0],
      date: formatDateOnly(submission.decidedOn)
    })

  const totalText = fill(labels.tonnesValue, {
    amount: formatTonnes3(total)
  })

  switch (submission.status) {
    case 'accepted':
      return [
        row(copy.totalPlaced, totalText),
        row(
          fill(copy.obligation, {
            year: obligation.indicativeObligationYear
          }),
          fill(labels.obligationValue, {
            amount: whole(obligation.indicativeObligationTonnes),
            period: submission.periodLabel
          })
        ),
        row(
          copy.evidence,
          fill(labels.tonnesValue, {
            amount: whole(obligation.evidenceAcquiredTonnes)
          })
        ),
        row(
          copy.remaining,
          fill(labels.remainingValue, {
            amount: whole(remaining),
            percent: Math.round(
              (remaining / obligation.indicativeObligationTonnes) * 100
            )
          })
        )
      ].filter(Boolean)
    case 'queried':
      return [
        row(
          copy.decision,
          fill(labels.decisionValue.queried, { count: sent.length })
        ),
        row(copy.restOfReturn, labels.restOfReturnValue),
        row(copy.assessedBy, assessedBy()),
        row(copy.respondBy, formatRespondBy(submission.respondBy) ?? '–')
      ]
    case 'rejected':
      return [
        row(copy.decision, labels.decisionValue.rejected),
        submission.rejectionType && row(copy.reason, submission.rejectionType),
        submission.reason && row(copy.details, submission.reason),
        submission.respondBy &&
          row(copy.resubmitBy, formatRespondBy(submission.respondBy)),
        row(copy.assessedBy, assessedBy())
      ].filter(Boolean)
    default:
      return [
        row(copy.totalPlaced, totalText),
        row(
          copy.producers,
          fill(labels.producersValue, {
            included: figures.length,
            total: seedData.prototypeRegulatorSchemeMembers.filter(
              (member) => member.schemeId === submission.schemeId
            ).length
          })
        ),
        row(
          copy.queries,
          drafts.length > 0
            ? fill(labels.draftQueriesValue, {
                count: drafts.length,
                producers: drafts.map((draft) => draft.producer).join(', ')
              })
            : labels.noDraftQueries
        ),
        row(
          copy.waste,
          fill(labels.wasteValue, { period: submission.periodLabel })
        ),
        row(
          copy.submittedBy,
          `${scheme.superUser.name}, ${scheme.superUser.email}`
        )
      ]
  }
}

// The records queried on a return. Queries the regulator sent from this
// journey are read first; where none exist (the return was queried in the
// compliance scheme's own seed), the scheme's queried figures stand in, so both
// sides of the journey list the same records.
const queriedRowsFor = (labels, submission, sent) => {
  const figures = getMemberFigures().filter(
    (figure) => figure.submissionId === submission.id
  )
  const correction = (member) =>
    figures.find(
      (figure) =>
        figure.status === 'resubmitted' &&
        normaliseMemberName(figure.member) === normaliseMemberName(member)
    )

  if (sent.length > 0) {
    return sent.map((record) => {
      const corrected = correction(record.member)
      return {
        producer: record.member,
        chemistry: record.chemistry,
        figure: corrected
          ? String(corrected.amendedTonnes)
          : formatTonnes3(record.originalTonnes),
        query: record.reason,
        status: corrected ? labels.queries.resubmitted : labels.queries.sent
      }
    })
  }

  return figures
    .filter((figure) => ['queried', 'resubmitted'].includes(figure.status))
    .map((figure) => ({
      producer: figure.member,
      chemistry: figure.chemistry,
      figure: String(figure.amendedTonnes ?? figure.figureTonnes),
      query: figure.reason,
      status:
        figure.status === 'resubmitted'
          ? labels.queries.resubmitted
          : labels.queries.sent
    }))
}

const buildViewModel = (
  request,
  { errors = {}, formValues = {}, forceDecisionForm = false } = {}
) => {
  const { schemeId, year, quarter } = request.params
  const labels = prototypeRegulatorContent.reviewPomReturn
  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  const submission = findSubmission(schemeId, year, quarter)
  if (!submission) {
    throw Boom.notFound()
  }

  const drafts = draftsFor(submission)
  const sent = sentQueriesFor(submission)
  const queriedRows =
    submission.status === 'queried'
      ? queriedRowsFor(labels, submission, sent)
      : []
  const status = submission.status
  const decided = ['accepted', 'queried', 'rejected'].includes(status)
  const values = {
    scheme: scheme.name,
    period: submission.periodLabel,
    quarter: submission.quarter,
    nextPeriod: nextPeriodLabel(quarter, year),
    submittedOn: formatDateOnly(submission.submittedOn),
    decidedOn: formatDateOnly(submission.decidedOn),
    deadline: submission.deadlineOn
      ? format(parseISO(submission.deadlineOn), 'd MMMM')
      : '',
    daysLate: submission.deadlineOn
      ? differenceInCalendarDays(
          parseISO(submission.submittedOn),
          parseISO(submission.deadlineOn)
        )
      : 0,
    lockOn: submission.deadlineOn
      ? format(lockDateFor(submission), 'd MMMM yyyy')
      : '',
    count: status === 'queried' ? queriedRows.length : drafts.length
  }
  const late = values.daysLate > 0
  const introKey =
    status === 'received'
      ? late
        ? 'received'
        : 'receivedOnTime'
      : status === 'accepted'
        ? late
          ? 'accepted'
          : 'acceptedOnTime'
        : status
  const banner = labels.banner[status]
  const filesCount = submission.filesCount + 1

  const sectionHref = (fragment) =>
    `${pathTo(paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission, { schemeId })}#${fragment}`

  return {
    ...basePageModel(
      {
        ...labels,
        heading: fill(labels.heading, values),
        intro: fill(labels.intro[introKey], values)
      },
      {
        backLink: {
          href: paths.prototypeRegulatorPomSubmissionDashboard,
          text: labels.backLink
        },
        headingTag: {
          text: labels.statusLabels[status],
          colour: labels.statusColours[status]
        }
      }
    ),
    status,
    decided,
    showDecisionForm: !decided || forceDecisionForm,
    banner: banner
      ? {
          ...banner,
          heading: fill(banner.heading, values),
          body: fill(banner.body, values)
        }
      : null,
    late: late ? labels.late : null,
    lockNote: values.lockOn ? fill(labels.lockNote, values) : null,
    summaryRows: buildSummary(labels, scheme, submission, drafts, queriedRows),
    queriesTable: queriedRows,
    seesHeading: fill(labels.sees.heading, values),
    seesBody: labels.sees.body,
    downloads: [
      fill(labels.downloads.queried, {
        file: `${scheme.name.replace(/\s+/g, '')}_${quarter}_${year}_queried.csv`
      }),
      labels.downloads.full
    ],
    reviewLinks: [
      {
        key: 'documents',
        text: fill(labels.links.documents, {
          file: `${scheme.name.replace(/\s+/g, '')}_${quarter}_${year}_explanations.docx`
        }),
        href: '#'
      },
      {
        key: 'figures',
        text: labels.links.figures,
        href: sectionHref('producer-figures')
      },
      {
        key: 'compare',
        text: labels.links.compare,
        href: sectionHref('compare-returns')
      },
      { key: 'waste', text: fill(labels.links.waste, values), href: '#' },
      {
        key: 'obligation',
        text: labels.links.obligation,
        href: sectionHref('indicative-obligation')
      },
      { key: 'reconcile', text: labels.links.reconcile, href: '#' },
      { key: 'amendments', text: labels.links.amendments, href: '#' },
      { key: 'threeYear', text: labels.links.threeYear, href: '#' }
    ],
    footerLinks: {
      obligationFull: {
        text: labels.footerLinks.obligationFull,
        href: sectionHref('indicative-obligation')
      },
      waste: { text: fill(labels.links.waste, values), href: '#' },
      files: {
        text: fill(labels.footerLinks.files, { count: filesCount }),
        href: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, {
          schemeId,
          year,
          quarter
        })
      },
      history: { text: labels.footerLinks.history, href: '#' },
      figures: {
        text: labels.footerLinks.figures,
        href: sectionHref('producer-figures')
      },
      obligation: {
        text: labels.footerLinks.obligation,
        href: sectionHref('indicative-obligation')
      },
      back: {
        text: labels.footerLinks.back,
        href: paths.prototypeRegulatorPomSubmissionDashboard
      }
    },
    rejectedNote: labels.rejectedNote,
    decisionIntro: fill(labels.decisionIntro, values),
    options: {
      accept: labels.options.accept,
      query: {
        ...labels.options.query,
        hint: fill(labels.options.query.hint, { count: drafts.length })
      },
      reject: labels.options.reject
    },
    reasonHint: fill(labels.reasonHint, values),
    action: reviewPath({ schemeId, year, quarter }),
    errors,
    formValues,
    errorSummary: Object.entries(errors).map(([field, text]) => ({
      text,
      href:
        field === 'decision'
          ? '#decision'
          : field === 'respondBy'
            ? '#respondBy-day'
            : `#${field}`
    }))
  }
}

export const reviewPomReturnController = {
  get: {
    handler(request, h) {
      if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(request.params.schemeId)) {
        throw Boom.notFound()
      }
      return h.view(view, buildViewModel(request))
    }
  },

  post: {
    handler(request, h) {
      const { schemeId, year, quarter } = request.params

      if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
        throw Boom.notFound()
      }
      const submission = findSubmission(schemeId, year, quarter)
      if (!submission) {
        throw Boom.notFound()
      }

      const labels = prototypeRegulatorContent.reviewPomReturn
      const payload = request.payload
      const decision = ['accept', 'query', 'reject'].includes(payload.decision)
        ? payload.decision
        : undefined
      const reason = (payload.reason ?? '').trim()
      const errors = {}
      let respondBy

      if (!decision) {
        errors.decision = labels.errors.decisionRequired
      }
      if (decision === 'query' || decision === 'reject') {
        if (!reason) {
          errors.reason = labels.errors.reasonRequired
        } else if (reason.length > REASON_MAX_LENGTH) {
          errors.reason = labels.errors.reasonTooLong
        }
        const read = readRespondBy(payload)
        if (read.error) {
          errors.respondBy = labels.errors[read.error]
        } else {
          respondBy = read.value
        }
      }
      if (decision === 'query' && draftsFor(submission).length === 0) {
        errors.decision = labels.errors.noDraftQueries
      }

      if (Object.keys(errors).length > 0) {
        return h.view(
          view,
          buildViewModel(request, {
            errors,
            formValues: payload,
            forceDecisionForm: true
          })
        )
      }

      const scheme = seedData.prototypeRegulatorSchemes.find(
        (s) => s.id === schemeId
      )
      const now = new Date().toISOString()

      if (decision === 'reject') {
        // The whole-return rejection is confirmed on its own screen, which
        // starts from what was typed here.
        request.yar.flash(
          rejectReasonFlashKey(schemeId, year, quarter),
          JSON.stringify({ reason, ...respondByFields(respondBy) })
        )
        return h.redirect(
          pathTo(
            paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
            { schemeId, year, quarter }
          )
        )
      }

      if (decision === 'accept') {
        updateSubmission(submission.id, {
          status: 'accepted',
          decidedOn: now,
          decidedBy: decidedByFor(scheme)
        })
      } else {
        const count = sendDraftQueries(schemeId, year, quarter, now)
        updateSubmission(submission.id, {
          status: 'queried',
          decidedOn: now,
          decidedBy: decidedByFor(scheme),
          reason,
          respondBy,
          issuesFound: count
        })
      }

      return h.redirect(reviewPath({ schemeId, year, quarter }))
    }
  }
}
