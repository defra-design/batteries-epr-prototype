import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'
import { statusCodes } from '../../../common/constants/status-codes.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../application/shared.js'
import { STEPS, isKnownStep } from './steps.js'

const flashKey = (step) => `evidence-issue:${step}`

const stepUrl = (step) =>
  paths.complianceSchemeEvidenceIssue.replace('{step}', step)

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
  const issueContent = content.complianceScheme(request).evidencePages.issue
  const stepContent = issueContent.steps[STEPS[step].contentKey]
  const compliancePeriodYear = getCompliancePeriod(request)

  return h.view(STEPS[step].view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: content.complianceScheme(request).evidencePages.errorTitle,
    listUrl: paths.complianceSchemeEvidence,
    step,
    compliancePeriodYear,
    action: stepUrl(step),
    ...viewModel
  })
}

export const issueController = {
  get: {
    handler(request, h) {
      const step = request.params.step
      if (!isKnownStep(step)) {
        return h.response().code(statusCodes.notFound)
      }
      const { errors, values } = readStepErrors(request, flashKey(step))
      const compliancePeriodYear = getCompliancePeriod(request)
      return renderStep(h, request, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'issue',
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
      const step = request.params.step
      if (!isKnownStep(step) || !STEPS[step].formStep) {
        return h.response().code(statusCodes.notFound)
      }
      const stepConfig = STEPS[step]
      const issueContent = content.complianceScheme(request).evidencePages.issue
      const stepContent = issueContent.steps[stepConfig.contentKey]
      const compliancePeriodYear = getCompliancePeriod(request)
      const payload = request.payload

      const { error, value } = stepConfig.schema.validate(payload)
      if (error) {
        const list = collectErrors(
          error,
          stepConfig.fieldMessages(stepContent.error)
        )
        flashStepErrors(request, flashKey(step), list, payload)
        return h.redirect(stepUrl(step))
      }

      const patch = stepConfig.toPatch(value)

      return renderStep(h, request, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'issue',
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
