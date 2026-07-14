import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { renderAuditEntries } from '../auditTrail/render.js'

const HISTORY_PREVIEW_LIMIT = 3

const CATEGORIES = ['portable', 'industrial', 'automotive']
const TYPES = ['collection', 'recycling']

const fieldId = (type, category) =>
  `${type}${category[0].toUpperCase()}${category.slice(1)}`

const clampPercent = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(0, number))
}

const fillInputs = (doc, targets) => {
  for (const type of TYPES) {
    for (const category of CATEGORIES) {
      doc.querySelector(`#${fieldId(type, category)}`).value = String(
        targets[type][category]
      )
    }
  }
}

const collectValues = (values) => {
  const build = (type) =>
    Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        clampPercent(values[type][category])
      ])
    )
  return { collection: build('collection'), recycling: build('recycling') }
}

export const runRegulatorTargets = (
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

  if (payload.target === 'persist') {
    storage.saveRegulatorTargets(
      agency.code,
      collectValues(payload.values),
      storage.currentRegulatorUser()
    )
    loc.assign('/regulator/targets?saved=1')
    return 'saved'
  }

  const label = doc.querySelector('[data-testid="regulator-targets-agency"]')
  label.textContent = agency.name
  label.hidden = false
  fillInputs(doc, storage.getRegulatorTargets(agency.code))
  renderAuditEntries(
    doc.querySelector('[data-testid="regulator-targets-history"]'),
    storage.listConfigAuditEntries(agency.code).slice(0, HISTORY_PREVIEW_LIMIT),
    payload.auditCopy
  )
  return 'hydrated'
}
