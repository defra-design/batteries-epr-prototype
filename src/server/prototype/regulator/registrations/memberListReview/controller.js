import { paths } from '../../../../../config/paths.js'
import { basePageModel } from '../shared.js'
import { fill } from '../applicationShared.js'
import { toErrorSummary } from '../applicationDecision.js'
import {
  findSchemeWithList,
  memberListBreadcrumbs,
  memberListContent,
  membersOf,
  schemePath,
  submittedOn
} from '../memberListShared.js'
import { saveMemberListDecision } from '../store.js'

const REASON_MAX_LENGTH = 1000
const view = 'prototype/regulator/registrations/memberListReview/view'

const buildViewModel = (schemeId, { errors = {}, formValues = {} } = {}) => {
  const labels = memberListContent().review
  const scheme = findSchemeWithList(schemeId)
  const values = { schemeName: scheme.name, submittedOn }
  const heading = fill(labels.heading, values)

  return {
    ...basePageModel(
      { title: heading, heading, intro: fill(labels.intro, values) },
      { currentNav: 'complianceSchemes' }
    ),
    breadcrumbs: memberListBreadcrumbs(scheme),
    labels,
    members: membersOf(schemeId),
    decisionIntro: fill(labels.decisionIntro, values),
    options: {
      accept: labels.options.accept,
      reject: {
        ...labels.options.reject,
        hint: fill(labels.options.reject.hint, values)
      }
    },
    reasonHint: fill(labels.reasonHint, values),
    errors,
    formValues,
    errorSummary: toErrorSummary(errors, { decision: '#decision-accept' }),
    action: schemePath(paths.prototypeRegulatorSchemeMemberList, schemeId)
  }
}

// A reason is only needed when rejecting; the confirmation always is.
const validate = (payload, messages) => {
  const decision = ['accept', 'reject'].includes(payload.decision)
    ? payload.decision
    : undefined
  const reason = (payload.reason ?? '').trim()
  const errors = {}

  if (!decision) {
    errors.decision = messages.decisionRequired
  }
  if (decision === 'reject' && !reason) {
    errors.reason = messages.reasonRequired
  } else if (reason.length > REASON_MAX_LENGTH) {
    errors.reason = messages.reasonTooLong
  }
  if (payload.confirm !== 'yes') {
    errors.confirm = messages.confirmRequired
  }

  return {
    decision,
    reason,
    errors,
    formValues: {
      decision,
      reason: payload.reason,
      confirm: payload.confirm === 'yes'
    }
  }
}

export const memberListReviewController = {
  get: {
    handler(request, h) {
      return h.view(view, buildViewModel(request.params.schemeId))
    }
  },

  post: {
    handler(request, h) {
      const { schemeId } = request.params
      findSchemeWithList(schemeId)
      const result = validate(
        request.payload ?? {},
        memberListContent().review.errors
      )

      if (Object.keys(result.errors).length > 0) {
        return h.view(
          view,
          buildViewModel(schemeId, {
            errors: result.errors,
            formValues: result.formValues
          })
        )
      }

      saveMemberListDecision(schemeId, {
        outcome: result.decision,
        reason: result.reason
      })
      return h.redirect(
        schemePath(
          result.decision === 'accept'
            ? paths.prototypeRegulatorSchemeMemberListAccepted
            : paths.prototypeRegulatorSchemeMemberListRejected,
          schemeId
        )
      )
    }
  }
}
