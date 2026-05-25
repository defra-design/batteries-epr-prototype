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

/* v8 ignore start */
const flattenReturn = (ret) => ({
  industrialAcceptedLeadAcid: ret?.industrial?.accepted?.leadAcid ?? '0.000',
  industrialAcceptedNickelCadmium:
    ret?.industrial?.accepted?.nickelCadmium ?? '0.000',
  industrialAcceptedOther: ret?.industrial?.accepted?.other ?? '0.000',
  industrialTreatedLeadAcid: ret?.industrial?.treated?.leadAcid ?? '0.000',
  industrialTreatedNickelCadmium:
    ret?.industrial?.treated?.nickelCadmium ?? '0.000',
  industrialTreatedOther: ret?.industrial?.treated?.other ?? '0.000',
  automotiveAcceptedLeadAcid: ret?.automotive?.accepted?.leadAcid ?? '0.000',
  automotiveAcceptedNickelCadmium:
    ret?.automotive?.accepted?.nickelCadmium ?? '0.000',
  automotiveAcceptedOther: ret?.automotive?.accepted?.other ?? '0.000',
  automotiveTreatedLeadAcid: ret?.automotive?.treated?.leadAcid ?? '0.000',
  automotiveTreatedNickelCadmium:
    ret?.automotive?.treated?.nickelCadmium ?? '0.000',
  automotiveTreatedOther: ret?.automotive?.treated?.other ?? '0.000'
})
/* v8 ignore stop */

export const runOperatorAnnualReturnStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const operator = ensureOperator(loc)
  if (!operator) return 'redirected-to-sign-in'

  if (payload.target === 'persist') {
    storage.upsertOperatorAnnualReturn(
      operator.id,
      payload.compliancePeriodYear,
      payload.patch
    )
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  if (payload.step === 'tonnages') {
    const existing = storage.findOperatorAnnualReturn(
      operator.id,
      payload.compliancePeriodYear
    )
    const form = doc.querySelector('form')
    if (form && existing) {
      hydrateForm(form, flattenReturn(existing))
    }
  }

  return 'hydrated'
}
