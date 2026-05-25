import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'

const ensureOperator = (loc) => {
  storage.seedDemoData()
  const operator = storage.currentOperator()
  if (!operator) {
    loc.assign('/operator/sign-in')
    return null
  }
  return operator
}

const hydrateStep = (doc, operator, payload) => {
  const existing = storage.findOperatorQuarterlyReturn(
    operator.id,
    payload.compliancePeriodYear,
    payload.quarter
  )

  if (payload.step === 'tonnages' && existing) {
    const values = {
      acceptedLeadAcid: existing.accepted.leadAcid,
      acceptedNickelCadmium: existing.accepted.nickelCadmium,
      acceptedOther: existing.accepted.other,
      treatedLeadAcid: existing.treated.leadAcid,
      treatedNickelCadmium: existing.treated.nickelCadmium,
      treatedOther: existing.treated.other
    }
    hydrateForm(doc.querySelector('form'), values)
  }

  if (payload.step === 'declaration') {
    const values = {
      declarationAccepted: existing?.status === 'submitted' ? 'yes' : ''
    }
    hydrateForm(doc.querySelector('form'), values)
  }

  return 'hydrated'
}

const persistStep = (operator, payload, loc) => {
  storage.upsertOperatorQuarterlyReturn(
    operator.id,
    payload.compliancePeriodYear,
    payload.quarter,
    payload.patch
  )
  if (payload.next) {
    loc.assign(payload.next)
    return 'navigated'
  }
  return 'persisted'
}

export const runOperatorQuarterlyStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const operator = ensureOperator(loc)
  if (!operator) return 'redirected-to-sign-in'

  if (payload.target === 'persist') {
    return persistStep(operator, payload, loc)
  }

  return hydrateStep(doc, operator, payload)
}
