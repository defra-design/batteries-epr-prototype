import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import joi from 'joi'
import { format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  buildLockInfo,
  decidedByFor,
  relatedLinksFor,
  rejectReasonFlashKey
} from '../shared.js'
import { updateSubmission } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const schema = joi
  .object({
    decision: joi.string().valid('accept', 'query', 'reject').required(),
    reason: joi.string().trim().min(1).required()
  })
  .options({ abortEarly: false, stripUnknown: true })

const formatDateOnly = (isoString) =>
  isoString ? format(parseISO(isoString), 'd MMMM yyyy') : null

const formatDateTime = (isoString) =>
  isoString ? format(parseISO(isoString), 'd MMM yyyy, HH:mm') : null

const buildStatusSteps = (pageContent, submission) => [
  {
    label: pageContent.statusSteps.submitted,
    date: formatDateTime(submission.submittedOn)
  },
  {
    label: pageContent.statusSteps.checksPassed,
    date: formatDateTime(submission.automatedChecksPassedOn)
  },
  {
    label: pageContent.statusSteps.underReview,
    date: submission.underReviewSince
      ? `Since ${formatDateOnly(submission.underReviewSince)}`
      : null
  },
  {
    label: pageContent.statusSteps.decision,
    date: submission.decidedOn
      ? formatDateOnly(submission.decidedOn)
      : pageContent.notDecidedYet
  }
]

const buildViewModel = (
  request,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const { schemeId, year, quarter } = request.params
  const pageContent = prototypeRegulatorContent.reviewPomReturn

  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  const submission = findSubmission(schemeId, year, quarter)
  if (!submission) {
    throw Boom.notFound()
  }

  const membersTotalCount = seedData.prototypeRegulatorSchemeMembers.filter(
    (m) => m.schemeId === schemeId
  ).length

  const { lockTagText, lockWarning } = buildLockInfo(submission)

  const action = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
    schemeId,
    year,
    quarter
  })

  return {
    ...basePageModel(
      {
        ...pageContent,
        heading: `${scheme.name} — ${submission.periodLabel} return`
      },
      paths.prototypeRegulatorPomSubmissionDashboard
    ),
    backLink: pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId }
    ),
    action,
    scheme,
    submission,
    statusLabel: pageContent.statusLabels[submission.status],
    statusColour: pageContent.statusColours[submission.status],
    intro: `${scheme.name} submitted their ${submission.periodLabel} return on ${formatDateOnly(submission.submittedOn)}. Review the summary below, then accept it, query individual figures, or — only for a systemic problem — reject the whole return.`,
    lockTagText,
    lockWarning,
    statusSteps: buildStatusSteps(pageContent, submission),
    totalPlacedOnMarketLine: `${submission.totalPlacedOnMarketTonnes.toLocaleString('en-GB')} tonnes`,
    membersIncludedLine: `${submission.membersCount} of ${membersTotalCount}`,
    swingCategoriesText: (submission.swingCategories ?? []).join(', '),
    submittedByLine: `${scheme.superUser.name}, ${scheme.superUser.email}`,
    yourReasonLine: submission.reason ?? null,
    relatedLinks: relatedLinksFor(pageContent, schemeId),
    decisionIntro: `Decide this quarter's return on its own — a problem here does not block later quarters. Your decision and reason are recorded in the service, and ${scheme.name} and the Agency see the same record.`,
    decisionOptions: [
      {
        value: 'accept',
        text: pageContent.decisionOptions.accept.label,
        hint: pageContent.decisionOptions.accept.hintTemplate
          .replace('{period}', submission.periodLabel)
          .replace('{scheme}', scheme.name)
      },
      {
        value: 'query',
        text: pageContent.decisionOptions.query.label,
        hint: pageContent.decisionOptions.query.hint
      },
      {
        value: 'reject',
        text: pageContent.decisionOptions.reject.label,
        hint: pageContent.decisionOptions.reject.hint
      }
    ],
    reasonHint: pageContent.reasonHintTemplate.replace('{scheme}', scheme.name),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors,
    formValues
  }
}

export const reviewPomReturnController = {
  get: {
    handler(request, h) {
      const { schemeId } = request.params

      if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
        throw Boom.notFound()
      }

      return h.view(
        'prototype/regulator/pomSubmission/reviewPomReturn/view',
        buildViewModel(request)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const pageContent = prototypeRegulatorContent.reviewPomReturn
          const errorMap = {}
          for (const detail of err.details) {
            const field = detail.path[0]
            if (!errorMap[field]) {
              errorMap[field] = pageContent.error[field]
            }
          }
          const errorSummary = Object.entries(errorMap).map(
            ([field, text]) => ({ text, href: `#${field}` })
          )

          return h
            .view(
              'prototype/regulator/pomSubmission/reviewPomReturn/view',
              buildViewModel(request, {
                errorSummary,
                errors: errorMap,
                formValues: request.payload
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { schemeId, year, quarter } = request.params

      if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
        throw Boom.notFound()
      }

      const { decision, reason } = request.payload
      const submission = findSubmission(schemeId, year, quarter)
      if (!submission) {
        throw Boom.notFound()
      }

      // Rejection needs an extra confirmation step (the systemic error type
      // and a checkbox) before anything is written — nothing is persisted
      // here for that path. The reason already typed is carried forward via
      // a one-time session flash so the confirm screen can prefill it.
      if (decision === 'reject') {
        request.yar.flash(rejectReasonFlashKey(schemeId, year, quarter), reason)
        return h.redirect(
          pathTo(
            paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
            {
              schemeId,
              year,
              quarter
            }
          )
        )
      }

      const scheme = seedData.prototypeRegulatorSchemes.find(
        (s) => s.id === schemeId
      )

      updateSubmission(submission.id, {
        status: decision === 'accept' ? 'accepted' : 'queried',
        decidedOn: new Date().toISOString(),
        decidedBy: decidedByFor(scheme),
        reason
      })

      const outcomeRoute =
        decision === 'accept'
          ? paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted
          : paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried

      return h.redirect(pathTo(outcomeRoute, { schemeId, year, quarter }))
    }
  }
}
