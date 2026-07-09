import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../application/shared.js'
import {
  STEPS,
  MEMBER_STEPS,
  MEMBER_STEP_ORDER,
  isKnownStep,
  isKnownMemberStep
} from './steps.js'

const flashKey = (step) => `ia:${step}`

const stepUrl = (step) => paths.complianceSchemeIa.replace('{step}', step)

const memberStepUrl = (memberId, step) =>
  paths.complianceSchemeIaMember
    .replace('{memberId}', memberId)
    .replace('{step}', step)

const nextUrl = (step) => {
  const next = STEPS[step].next
  return next ? stepUrl(next) : null
}

const nextMemberStepUrl = (memberId, currentStep) => {
  const idx = MEMBER_STEP_ORDER.indexOf(currentStep)
  if (idx < MEMBER_STEP_ORDER.length - 1) {
    return memberStepUrl(memberId, MEMBER_STEP_ORDER[idx + 1])
  }
  return stepUrl('member-list')
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
    ...viewModel
  })
}

const renderMemberStep = (h, request, memberId, step, viewModel) => {
  const iaContent = content.complianceScheme(request).iaPages
  const stepConfig = MEMBER_STEPS[step]
  const stepContent = iaContent.steps[stepConfig.contentKey]

  return h.view(stepConfig.view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: iaContent.errorTitle,
    continueAction: iaContent.continueAction,
    dashboardUrl: paths.complianceSchemeDashboard,
    memberId,
    step,
    action: memberStepUrl(memberId, step),
    memberListUrl: stepUrl('member-list'),
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
          next: nextUrl(step),
          memberStepUrlTemplate: memberStepUrl('{memberId}', 'placed')
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

export const iaMemberController = {
  get: {
    handler(request, h) {
      const { memberId, step } = request.params
      if (!isKnownMemberStep(step)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const flashId = flashKey(`member:${memberId}:${step}`)
      const { errors, values } = readStepErrors(request, flashId)

      return renderMemberStep(h, request, memberId, step, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'ia-member',
          memberId,
          step,
          compliancePeriodYear,
          target: 'hydrate',
          next: nextMemberStepUrl(memberId, step)
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const { memberId, step } = request.params
      if (!isKnownMemberStep(step)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const stepConfig = MEMBER_STEPS[step]
      const iaContent = content.complianceScheme(request).iaPages
      const stepContent = iaContent.steps[stepConfig.contentKey]
      const payload = request.payload

      const { error, value } = stepConfig.schema.validate(payload)
      if (error) {
        const flashId = flashKey(`member:${memberId}:${step}`)
        const list = collectErrors(
          error,
          stepConfig.fieldMessages(stepContent.error)
        )
        flashStepErrors(request, flashId, list, payload)
        return h.redirect(memberStepUrl(memberId, step))
      }

      const patch = stepConfig.toPatch(value)

      return renderMemberStep(h, request, memberId, step, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'ia-member',
          memberId,
          step,
          compliancePeriodYear,
          target: 'persist',
          patch,
          next: nextMemberStepUrl(memberId, step)
        }
      })
    }
  }
}
