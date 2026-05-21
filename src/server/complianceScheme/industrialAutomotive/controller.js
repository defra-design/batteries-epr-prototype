import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../application/shared.js'
import { STEPS, isKnownStep } from './steps.js'

const flashKey = (step) => `ia:${step}`

const stepUrl = (step) => paths.complianceSchemeIa.replace('{step}', step)

const nextUrl = (step) => {
  const next = STEPS[step].next
  return next ? stepUrl(next) : null
}

const collectErrors = (joiError, fieldMessages) =>
  joiError.details.map((detail) => {
    const field = detail.path[0]
    const message = fieldMessages[field]
    const text =
      detail.type === 'string.pattern.base' ? message.format : message.required
    return { text, href: `#${field}` }
  })

const renderStep = (h, request, step, viewModel) => {
  const iaContent = content.complianceScheme(request).iaPages
  const stepContent = iaContent.steps[STEPS[step].contentKey]

  return h.view(STEPS[step].view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: iaContent.errorTitle,
    continueAction: iaContent.continueAction,
    confirmAction: iaContent.confirmAction,
    dashboardUrl: paths.complianceSchemeDashboard,
    step,
    action: stepUrl(step),
    placedUrl: stepUrl('placed'),
    exportedUrl: stepUrl('exported'),
    takenBackUrl: stepUrl('taken-back'),
    deliveredUrl: stepUrl('delivered'),
    ...viewModel
  })
}

export const iaController = {
  get: {
    handler(request, h) {
      const { step } = request.params
      if (!isKnownStep(step)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const { errors, values } = readStepErrors(request, flashKey(step))

      return renderStep(h, request, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'ia',
          step,
          compliancePeriodYear,
          target: 'hydrate',
          next: nextUrl(step)
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const { step } = request.params
      if (!isKnownStep(step) || !STEPS[step].formStep) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const stepConfig = STEPS[step]
      const iaContent = content.complianceScheme(request).iaPages
      const stepContent = iaContent.steps[stepConfig.contentKey]
      const payload = request.payload

      const { error, value } = stepConfig.schema.validate(payload)
      if (error) {
        const list = collectErrors(error, stepConfig.fieldMessages(stepContent.error))
        flashStepErrors(request, flashKey(step), list, payload)
        return h.redirect(stepUrl(step))
      }

      const patch = stepConfig.toPatch(value)

      return renderStep(h, request, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'ia',
          step,
          compliancePeriodYear,
          target: 'persist',
          patch,
          next: nextUrl(step)
        }
      })
    }
  }
}
