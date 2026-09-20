import Boom from '@hapi/boom'
import joi from 'joi'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { updateMemberFigure } from '../../../regulator/pomSubmission/store.js'
import { taskFlowPageModel } from '../../pomSubmission/shared.js'
import { queriedFigureFor, returnFor } from '../shared.js'

const pageContent = prototypeComplianceSchemeContent.queryResponse.correctFigure
const reviewContent =
  prototypeComplianceSchemeContent.queryResponse.reviewFigure

const validateTonnage = (value, helpers) => {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return helpers.error('tonnage.format')
  }
  if (/\.\d{4,}$/.test(value)) {
    return helpers.error('tonnage.decimals')
  }
  if (Number(value) <= 0) {
    return helpers.error('tonnage.positive')
  }
  return value
}

const schema = joi
  .object({
    tonnage: joi.string().trim().required().custom(validateTonnage).messages({
      'tonnage.format': 'tonnage.format',
      'tonnage.decimals': 'tonnage.decimals',
      'tonnage.positive': 'tonnage.positive'
    })
  })
  .options({ abortEarly: false, stripUnknown: true })

const errorKeyFor = (detail) =>
  detail.type.startsWith('tonnage.')
    ? detail.type.replace('tonnage.', '')
    : 'required'

// The record must belong to the scheme's queried return and still be
// awaiting a correction; otherwise there is nothing to correct.
const resolve = (request) => {
  const { year, quarter, recordId } = request.params
  const submission = returnFor(year, quarter)
  const figure = submission ? queriedFigureFor(submission, recordId) : null
  if (!figure) {
    throw Boom.notFound()
  }
  return { year, quarter, recordId, submission, figure }
}

const buildViewModel = (
  request,
  { errors = {}, errorSummary = [], tonnage = '' } = {}
) => {
  const { year, quarter, recordId, submission, figure } = resolve(request)
  const heading = pageContent.headingTemplate
    .replace('{member}', figure.member)
    .replace('{chemistry}', figure.chemistry)

  return {
    ...taskFlowPageModel({
      ...pageContent,
      title: errorSummary.length ? `Error: ${heading}` : heading,
      heading
    }),
    backLink: pathTo(paths.prototypeComplianceSchemeQueryResponseReviewFigure, {
      year,
      quarter,
      recordId
    }),
    action: pathTo(paths.prototypeComplianceSchemeQueryResponseCorrectFigure, {
      year,
      quarter,
      recordId
    }),
    caption: reviewContent.captionTemplate.replace(
      '{period}',
      submission.periodLabel
    ),
    intro: pageContent.introTemplate
      .replace(
        '{figure}',
        reviewContent.figureTemplate.replace(
          '{tonnes}',
          figure.figureTonnes.toLocaleString('en-GB')
        )
      )
      .replace('{reason}', figure.reason),
    errorSummary,
    errors,
    values: { tonnage }
  }
}

export const correctFigureController = {
  get: {
    handler(request, h) {
      return h.view(
        'prototype/complianceScheme/queryResponse/correctFigure/view',
        buildViewModel(request)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const errors = {}
          const errorSummary = []
          for (const detail of err.details) {
            const field = detail.path[0]
            if (errors[field]) {
              continue
            }
            const text = pageContent.error[field][errorKeyFor(detail)]
            errors[field] = text
            errorSummary.push({ text, href: `#${field}` })
          }

          return h
            .view(
              'prototype/complianceScheme/queryResponse/correctFigure/view',
              buildViewModel(request, {
                errors,
                errorSummary,
                tonnage: request.payload?.tonnage ?? ''
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { year, quarter, recordId, figure } = resolve(request)

      updateMemberFigure(figure.id, {
        status: 'resubmitted',
        amendedTonnes: Number(request.payload.tonnage),
        resubmittedOn: new Date().toISOString()
      })

      return h.redirect(
        pathTo(paths.prototypeComplianceSchemeQueryResponseFigureResent, {
          year,
          quarter,
          recordId
        })
      )
    }
  }
}
