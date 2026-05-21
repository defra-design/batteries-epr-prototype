import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../application/shared.js'
import { STEPS, isKnownQuarter, isKnownStep } from './steps.js'

const flashKey = (quarter, step) => `quarterly:${quarter}:${step}`

const stepUrl = (quarter, step) =>
  paths.complianceSchemeQuarterly
    .replace('{quarter}', quarter)
    .replace('{step}', step)

const nextUrl = (quarter, step) => {
  const next = STEPS[step].next
  return next ? stepUrl(quarter, next) : null
}

const collectErrors = (joiError, fieldMessages) =>
  joiError.details.map((detail) => {
    const field = detail.path[0]
    const message = fieldMessages[field]
    const text =
      detail.type === 'string.pattern.base' ? message.format : message.required
    return { text, href: `#${field}` }
  })

const renderStep = (h, request, quarter, step, viewModel) => {
  const quarterlyContent = content.complianceScheme(request).quarterlyPages
  const stepContent = quarterlyContent.steps[STEPS[step].contentKey]

  return h.view(STEPS[step].view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: quarterlyContent.errorTitle,
    continueAction: quarterlyContent.continueAction,
    confirmAction: quarterlyContent.confirmAction,
    dashboardUrl: paths.complianceSchemeDashboard,
    quarter,
    step,
    action: stepUrl(quarter, step),
    marketDataUrl: stepUrl(quarter, 'market-data'),
    wasteDataUrl: stepUrl(quarter, 'waste-data'),
    ...viewModel
  })
}

export const quarterlyController = {
  get: {
    handler(request, h) {
      const { quarter, step } = request.params
      if (!isKnownQuarter(quarter) || !isKnownStep(step)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const { errors, values } = readStepErrors(request, flashKey(quarter, step))

      return renderStep(h, request, quarter, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'quarterly',
          quarter,
          step,
          compliancePeriodYear,
          target: 'hydrate',
          next: nextUrl(quarter, step)
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const { quarter, step } = request.params
      if (
        !isKnownQuarter(quarter) ||
        !isKnownStep(step) ||
        !STEPS[step].formStep
      ) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const stepConfig = STEPS[step]
      const quarterlyContent = content.complianceScheme(request).quarterlyPages
      const stepContent = quarterlyContent.steps[stepConfig.contentKey]
      const payload = request.payload
      const { error, value } = stepConfig.schema.validate(payload)
      if (error) {
        const list = collectErrors(error, stepConfig.fieldMessages(stepContent.error))
        flashStepErrors(request, flashKey(quarter, step), list, payload)
        return h.redirect(stepUrl(quarter, step))
      }

      const patch = stepConfig.toPatch(value)

      return renderStep(h, request, quarter, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'quarterly',
          quarter,
          step,
          compliancePeriodYear,
          target: 'persist',
          patch,
          next: nextUrl(quarter, step)
        }
      })
    }
  }
}

