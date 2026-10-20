import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  decidedByFor,
  fill,
  findSubmission,
  rejectReasonFlashKey,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import { readRespondBy } from '../reviewShared.js'
import { updateSubmission } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const DETAILS_MAX_LENGTH = 1000
const view =
  'prototype/regulator/pomSubmission/reviewPomReturnRejectConfirm/view'

const locate = (params) => {
  const { schemeId, year, quarter } = params
  if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
    throw Boom.notFound()
  }
  const submission = findSubmission(schemeId, year, quarter)
  if (!submission) {
    throw Boom.notFound()
  }
  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  return { scheme, submission }
}

const reviewHref = ({ schemeId, year, quarter }) =>
  pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
    schemeId,
    year,
    quarter
  })

// What the regulator typed on the review screen is carried here once, via the
// session flash, so it is not lost.
const readFlash = (request) => {
  const { schemeId, year, quarter } = request.params
  const raw = request.yar.flash(
    rejectReasonFlashKey(schemeId, year, quarter)
  )[0]
  if (!raw) {
    return {}
  }
  const { reason, ...fields } = JSON.parse(raw)
  return { details: reason, ...fields }
}

const buildViewModel = (request, { errors = {}, formValues } = {}) => {
  const labels = prototypeRegulatorContent.rejectConfirm
  const { scheme, submission } = locate(request.params)
  const values = { scheme: scheme.name, period: submission.periodLabel }
  const fields = formValues ?? readFlash(request)

  return {
    ...basePageModel(
      {
        ...labels,
        heading: fill(labels.heading, values),
        intro: fill(labels.intro, values)
      },
      {
        backLink: {
          href: paths.prototypeRegulatorPomSubmissionDashboard,
          text: labels.backLink
        },
        headingTag: labels.tag
      }
    ),
    warning: fill(labels.warning, values),
    types: Object.entries(labels.types).map(([value, type]) => ({
      value,
      text: type.text,
      hint: { text: type.hint },
      checked: fields.errorType === value,
      attributes: { 'data-testid': `reject-type-${value}` }
    })),
    detailsHint: fill(labels.detailsHint, values),
    action: pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      request.params
    ),
    cancelHref: reviewHref(request.params),
    errors,
    formValues: fields,
    errorSummary: Object.entries(errors).map(([field, text]) => ({
      text,
      href:
        field === 'errorType'
          ? '#errorType'
          : field === 'respondBy'
            ? '#respondBy-day'
            : `#${field}`
    }))
  }
}

export const reviewPomReturnRejectConfirmController = {
  get: {
    handler(request, h) {
      return h.view(view, buildViewModel(request))
    }
  },

  post: {
    handler(request, h) {
      const labels = prototypeRegulatorContent.rejectConfirm
      const { scheme, submission } = locate(request.params)
      const payload = request.payload
      const errors = {}

      const type = labels.types[payload.errorType]
      if (!type) {
        errors.errorType = labels.errors.typeRequired
      }
      const details = (payload.details ?? '').trim()
      if (!details) {
        errors.details = labels.errors.detailsRequired
      } else if (details.length > DETAILS_MAX_LENGTH) {
        errors.details = labels.errors.detailsTooLong
      }
      const respondBy = readRespondBy(payload)
      if (respondBy.error) {
        errors.respondBy = labels.errors[respondBy.error]
      }

      if (Object.keys(errors).length > 0) {
        return h.view(
          view,
          buildViewModel(request, { errors, formValues: payload })
        )
      }

      updateSubmission(submission.id, {
        status: 'rejected',
        decidedOn: new Date().toISOString(),
        decidedBy: decidedByFor(scheme),
        rejectionType: type.text,
        reason: details,
        respondBy: respondBy.value
      })
      return h.redirect(reviewHref(request.params))
    }
  }
}
