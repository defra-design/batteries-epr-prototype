import { categoryFieldName } from '../../../../config/battery-categories.js'
import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { renderAuditEntries } from '../auditTrail/render.js'

const HISTORY_PREVIEW_LIMIT = 3

const TYPES = ['collection', 'recycling']

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const clampPercent = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(0, number))
}

const inputMarkup = (type, category) => {
  const fieldId = categoryFieldName(type, category.id)
  return `<div class="govuk-form-group">
    <label class="govuk-label" for="${escapeHtml(fieldId)}">${escapeHtml(category.shortLabel)}</label>
    <div class="govuk-input__wrapper">
      <input class="govuk-input govuk-input--width-3" id="${escapeHtml(fieldId)}" name="${escapeHtml(fieldId)}" inputmode="numeric" spellcheck="false" data-testid="regulator-targets-${type}-${escapeHtml(category.id)}">
      <div class="govuk-input__suffix" aria-hidden="true">%</div>
    </div>
  </div>`
}

const renderFields = (doc, categories) => {
  for (const type of TYPES) {
    doc.querySelector(
      `[data-testid="regulator-targets-${type}-fields"]`
    ).innerHTML = categories
      .map((category) => inputMarkup(type, category))
      .join('')
  }
}

const fillInputs = (doc, categories, targets) => {
  for (const type of TYPES) {
    for (const category of categories) {
      doc.querySelector(`#${categoryFieldName(type, category.id)}`).value =
        String(targets[type][category.id] ?? 0)
    }
  }
}

const collectValues = (values) => {
  const build = (type) =>
    Object.fromEntries(
      Object.keys(values[type]).map((category) => [
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

  const categories = storage.resolveCategories(agency.code)
  renderFields(doc, categories)

  const form = doc.querySelector('[data-testid="regulator-targets-form"]')
  const hidden = doc.createElement('input')
  hidden.type = 'hidden'
  hidden.name = 'categoryIds'
  hidden.value = categories.map((category) => category.id).join(',')
  form.appendChild(hidden)

  fillInputs(doc, categories, storage.getRegulatorTargets(agency.code))
  renderAuditEntries(
    doc.querySelector('[data-testid="regulator-targets-history"]'),
    storage
      .listConfigAuditEntries(agency.code, { configType: 'target' })
      .slice(0, HISTORY_PREVIEW_LIMIT),
    payload.auditCopy
  )
  return 'hydrated'
}
