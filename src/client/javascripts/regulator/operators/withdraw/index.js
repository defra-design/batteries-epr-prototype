import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

export const runRegulatorOperatorWithdraw = (doc, loc) => {
  const payload = readPagePayload(doc)

  if (payload.target === 'persist') {
    storage.withdrawOperatorApproval(payload.operatorId, payload.reason)
    loc.assign('/regulator/operators')
    return 'navigated'
  }

  const operator = storage.getOperator(payload.operatorId)
  const nameEl = doc.querySelector('[data-testid="operator-withdraw-name"]')
  if (operator && nameEl) {
    nameEl.textContent = operator.name
    nameEl.hidden = false
  }

  return 'hydrated'
}
