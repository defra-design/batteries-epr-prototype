import { paths } from '../../../../config/paths.js'
import { applicationPath } from './applicationShared.js'
import { saveApplicationDecision } from './store.js'

const REASON_MAX_LENGTH = 1000

// Approve and Reject share one decision. The reason is only required when
// rejecting; the confirmation is required wherever the form shows it. Returns
// the first error per field, in the order the fields appear on the page.
export const validateDecision = (payload, { errors: messages, confirm }) => {
  const outcome = payload.decision === 'reject' ? 'reject' : 'approve'
  const reason = (payload.reason ?? '').trim()
  const errors = {}

  if (outcome === 'reject' && !reason) {
    errors.reason = messages.reasonRequired
  } else if (reason.length > REASON_MAX_LENGTH) {
    errors.reason = messages.reasonTooLong
  }
  if (confirm && payload.confirm !== 'yes') {
    errors.confirm = messages.confirmRequired
  }

  return {
    outcome,
    reason,
    errors,
    formValues: {
      reason: payload.reason,
      confirm: payload.confirm === 'yes'
    }
  }
}

export const recordDecision = (applicationId, { outcome, reason }, h) => {
  saveApplicationDecision(applicationId, {
    outcome,
    reason: outcome === 'reject' ? reason : ''
  })
  const path =
    outcome === 'approve'
      ? paths.prototypeRegulatorApplicationAccepted
      : paths.prototypeRegulatorApplicationRejected
  return h.redirect(applicationPath(path, { applicationId }))
}

export const toErrorSummary = (errors, hrefs = {}) =>
  Object.entries(errors).map(([field, text]) => ({
    text,
    href: hrefs[field] ?? `#${field}`
  }))
