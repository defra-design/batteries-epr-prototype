import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import joi from 'joi'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  decidedByFor,
  rejectReasonFlashKey
} from '../shared.js'
import { updateSubmission } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const ERROR_TYPE_VALUES = {
  corruptedFile: 'corrupted-file',
  templateMismatch: 'template-mismatch',
  filesOutOfSync: 'files-out-of-sync',
  otherSystemic: 'other-systemic'
}

const schema = joi
  .object({
    errorType: joi
      .string()
      .valid(...Object.values(ERROR_TYPE_VALUES))
      .required(),
    reason: joi.string().trim().min(1).required(),
    confirmed: joi.string().valid('true').required()
  })
  .options({ abortEarly: false, stripUnknown: true })

const buildViewModel = (
  request,
  { errorSummary = [], errors = {}, formValues = null } = {}
) => {
  const { schemeId, year, quarter } = request.params
  const pageContent = prototypeRegulatorContent.reviewPomReturnRejectConfirm

  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  const submission = findSubmission(schemeId, year, quarter)
  if (!submission) {
    throw Boom.notFound()
  }

  // The reason already typed on the review screen is carried forward once,
  // via the session flash, so it's prefilled here rather than lost.
  const flashedReason = request.yar.flash(
    rejectReasonFlashKey(schemeId, year, quarter)
  )[0]
  const resolvedFormValues = formValues ?? { reason: flashedReason ?? '' }

  const recordsWithNoIssues = (
    submission.recordsCount - (submission.issuesFound ?? 0)
  ).toLocaleString('en-GB')

  const errorTypeItems = Object.entries(ERROR_TYPE_VALUES).map(
    ([key, value]) => ({
      value,
      text: pageContent.errorTypeOptions[key].label,
      hint: pageContent.errorTypeOptions[key].hint,
      checked: resolvedFormValues.errorType === value
    })
  )

  return {
    ...basePageModel(
      {
        ...pageContent,
        heading: pageContent.headingTemplate.replace(
          '{period}',
          submission.periodLabel
        )
      },
      paths.prototypeRegulatorPomSubmissionDashboard
    ),
    backLink: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId,
      year,
      quarter
    }),
    action: pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      { schemeId, year, quarter }
    ),
    cancelHref: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId,
      year,
      quarter
    }),
    scheme,
    submission,
    intro: pageContent.introTemplate
      .replace('{scheme}', scheme.name)
      .replace(/\{period\}/g, submission.periodLabel)
      .replace('{recordsWithNoIssues}', recordsWithNoIssues),
    warningText: pageContent.warningTextTemplate.replace(
      '{period}',
      submission.periodLabel
    ),
    errorTypeItems,
    reasonHint: pageContent.reasonHintTemplate.replace('{scheme}', scheme.name),
    confirmedChecked: resolvedFormValues.confirmed === 'true',
    errorTitle: pageContent.error.title,
    errorSummary,
    errors,
    formValues: resolvedFormValues
  }
}

export const reviewPomReturnRejectConfirmController = {
  get: {
    handler(request, h) {
      const { schemeId } = request.params

      if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
        throw Boom.notFound()
      }

      return h.view(
        'prototype/regulator/pomSubmission/reviewPomReturnRejectConfirm/view',
        buildViewModel(request)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const pageContent =
            prototypeRegulatorContent.reviewPomReturnRejectConfirm
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
              'prototype/regulator/pomSubmission/reviewPomReturnRejectConfirm/view',
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

      const { errorType, reason } = request.payload
      const submission = findSubmission(schemeId, year, quarter)
      if (!submission) {
        throw Boom.notFound()
      }

      const scheme = seedData.prototypeRegulatorSchemes.find(
        (s) => s.id === schemeId
      )

      updateSubmission(submission.id, {
        status: 'rejected',
        decidedOn: new Date().toISOString(),
        decidedBy: decidedByFor(scheme),
        reason,
        rejectionType: errorType
      })

      return h.redirect(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected, {
          schemeId,
          year,
          quarter
        })
      )
    }
  }
}
