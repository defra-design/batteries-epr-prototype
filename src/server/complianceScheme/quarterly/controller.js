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
  isKnownQuarter,
  isKnownStep,
  isKnownMemberStep
} from './steps.js'

const flashKey = (quarter, step) => `quarterly:${quarter}:${step}`

const stepUrl = (quarter, step) =>
  paths.complianceSchemeQuarterly
    .replace('{quarter}', quarter)
    .replace('{step}', step)

const memberStepUrl = (quarter, memberId, dataType) =>
  paths.complianceSchemeQuarterlyMember
    .replace('{quarter}', quarter)
    .replace('{memberId}', memberId)
    .replace('{dataType}', dataType)

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
    ...viewModel
  })
}

const renderMemberStep = (h, request, quarter, memberId, dataType, viewModel) => {
  const quarterlyContent = content.complianceScheme(request).quarterlyPages
  const stepConfig = MEMBER_STEPS[dataType]
  const stepContent = quarterlyContent.steps[stepConfig.contentKey]

  return h.view(stepConfig.view, {
    pageTitle: stepContent.title,
    heading: stepContent.heading,
    intro: stepContent.intro,
    labels: stepContent,
    errorTitle: quarterlyContent.errorTitle,
    continueAction: quarterlyContent.continueAction,
    dashboardUrl: paths.complianceSchemeDashboard,
    quarter,
    memberId,
    dataType,
    action: memberStepUrl(quarter, memberId, dataType),
    memberListUrl: stepUrl(quarter, 'member-list'),
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
          next: nextUrl(quarter, step),
          memberStepUrlTemplate: memberStepUrl(quarter, '{memberId}', '{dataType}')
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

export const quarterlyMemberController = {
  get: {
    handler(request, h) {
      const { quarter, memberId, dataType } = request.params
      if (!isKnownQuarter(quarter) || !isKnownMemberStep(dataType)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const flashId = flashKey(quarter, `member:${memberId}:${dataType}`)
      const { errors, values } = readStepErrors(request, flashId)

      return renderMemberStep(h, request, quarter, memberId, dataType, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'quarterly-member',
          quarter,
          memberId,
          dataType,
          compliancePeriodYear,
          target: 'hydrate',
          next: stepUrl(quarter, 'member-list')
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const { quarter, memberId, dataType } = request.params
      if (!isKnownQuarter(quarter) || !isKnownMemberStep(dataType)) {
        return h.response().code(statusCodes.notFound)
      }
      const compliancePeriodYear = getCompliancePeriod(request)
      const stepConfig = MEMBER_STEPS[dataType]
      const quarterlyContent = content.complianceScheme(request).quarterlyPages
      const stepContent = quarterlyContent.steps[stepConfig.contentKey]
      const payload = request.payload
      const { error, value } = stepConfig.schema.validate(payload)

      if (error) {
        const flashId = flashKey(quarter, `member:${memberId}:${dataType}`)
        const list = collectErrors(error, stepConfig.fieldMessages(stepContent.error))
        flashStepErrors(request, flashId, list, payload)
        return h.redirect(memberStepUrl(quarter, memberId, dataType))
      }

      const patch = stepConfig.toPatch(value)

      return renderMemberStep(h, request, quarter, memberId, dataType, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'quarterly-member',
          quarter,
          memberId,
          dataType,
          compliancePeriodYear,
          target: 'persist',
          patch,
          next: stepUrl(quarter, 'member-list')
        }
      })
    }
  }
}
