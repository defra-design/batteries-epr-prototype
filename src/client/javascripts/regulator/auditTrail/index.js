import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { renderAuditTable } from './render.js'

export const runRegulatorAuditTrail = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  storage.seedDemoData()
  const agency = storage.currentAgency()
  if (!agency) {
    loc.assign('/regulator/sign-in')
    return 'redirected-to-sign-in'
  }

  const payload = readPagePayload(doc)

  const label = doc.querySelector('[data-testid="audit-trail-agency"]')
  label.textContent = agency.name
  label.hidden = false

  return renderAuditTable(
    doc.querySelector('[data-testid="audit-trail-list"]'),
    doc.querySelector('[data-testid="audit-trail-empty"]'),
    storage.listConfigAuditEntries(agency.code),
    payload.copy
  )
}
