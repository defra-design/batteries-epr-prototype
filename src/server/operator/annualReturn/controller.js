import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { STEPS, isKnownStep } from './steps.js'
import {
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../application/shared.js'

const stepUrl = (step) => paths.operatorAnnualReturn.replace('{step}', step)

const renderStep = (h, request, step, viewModel) => {
  const annualPages = content.operator(request).annualPages
  const stepContent = annualPages.steps[STEPS[step].contentKey]

  return h.view(STEPS[step].view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: annualPages.errorTitle,
    continueAction:
      step === 'declaration'
        ? annualPages.confirmAction
        : annualPages.continueAction,
    dashboardUrl: paths.operatorDashboard,
    action: stepUrl(step),
    step,
    ...viewModel
  })
}

const nextUrl = (step) => {
  const next = STEPS[step].next
  return next ? stepUrl(next) : null
}

const buildHydratePayload = (step, compliancePeriodYear) => ({
  step,
  target: 'hydrate',
  compliancePeriodYear,
  next: nextUrl(step)
})

const buildPersistPayload = (step, patch, compliancePeriodYear) => ({
  step,
  target: 'persist',
  compliancePeriodYear,
  patch,
  next: nextUrl(step)
})

export const annualReturnController = {
  get: {
    handler(request, h) {
      const step = request.params.step
      if (!isKnownStep(step)) {
        return h.response().code(statusCodes.notFound)
      }

      const compliancePeriodYear = getCompliancePeriod(request)
      const { errors, values } = readStepErrors(request, step)

      return renderStep(h, request, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: buildHydratePayload(step, compliancePeriodYear)
      })
    }
  },

  post: {
    handler(request, h) {
      const step = request.params.step
      if (!isKnownStep(step) || step === 'confirmation') {
        return h.response().code(statusCodes.notFound)
      }

      const compliancePeriodYear = getCompliancePeriod(request)
      const { schema, fieldMessages, toPatch } = STEPS[step]
      const { error, value } = schema.validate(request.payload || {})

      if (error) {
        const annualPages = content.operator(request).annualPages
        const stepContent = annualPages.steps[STEPS[step].contentKey]
        const list = collectErrors(error, fieldMessages(stepContent.error))
        flashStepErrors(request, step, list, request.payload)
        return h.redirect(stepUrl(step))
      }

      const patch = toPatch(value)

      return renderStep(h, request, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: buildPersistPayload(step, patch, compliancePeriodYear)
      })
    }
  }
}
