import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { STEPS, isKnownStep } from './steps.js'
import {
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from './shared.js'

const stepUrl = (step) => paths.operatorApplication.replace('{step}', step)

const renderStep = (h, request, step, viewModel) => {
  const application = content.operator(request).application
  const stepContent = application.steps[STEPS[step].contentKey]

  return h.view(STEPS[step].view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: application.errorTitle,
    continueAction: application.continueAction,
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

const buildHydratePayload = (step) => ({
  step,
  target: 'hydrate',
  next: nextUrl(step)
})

const buildPersistPayload = (step, patch) => ({
  step,
  target: 'persist',
  patch,
  next: nextUrl(step)
})

export const applicationController = {
  get: {
    handler(request, h) {
      const step = request.params.step
      if (!isKnownStep(step)) {
        return h.response().code(statusCodes.notFound)
      }

      const { errors, values } = readStepErrors(request, step)

      return renderStep(h, request, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: buildHydratePayload(step)
      })
    }
  },

  post: {
    handler(request, h) {
      const step = request.params.step
      if (!isKnownStep(step) || step === 'confirmation') {
        return h.response().code(statusCodes.notFound)
      }

      const { schema, fieldMessages, toOperatorPatch } = STEPS[step]
      const { error, value } = schema.validate(request.payload || {})

      if (error) {
        const application = content.operator(request).application
        const stepContent = application.steps[STEPS[step].contentKey]
        const list = collectErrors(error, fieldMessages(stepContent.error))
        flashStepErrors(request, step, list, request.payload)
        return h.redirect(stepUrl(step))
      }

      const patch = toOperatorPatch(value)

      return renderStep(h, request, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: buildPersistPayload(step, patch)
      })
    }
  }
}
