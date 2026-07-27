import { targetYearFieldName } from '../../../../config/battery-categories.js'
import { readPagePayload } from '../../page-payload.js'
import { storage } from '../../storage-adapter.js'
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

const isYearMap = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const explicitValue = (targets, type, categoryId, year) => {
  const value = targets?.[type]?.[categoryId]
  return isYearMap(value) ? value[year] : value
}

const resolvedValue = (targets, type, categoryId, year) => {
  const value = targets?.[type]?.[categoryId]
  if (!isYearMap(value)) return value ?? 0
  const configuredYears = Object.keys(value)
    .map(Number)
    .filter((configuredYear) => Number.isInteger(configuredYear))
    .filter((configuredYear) => configuredYear <= Number(year))
    .sort((a, b) => b - a)
  const effectiveYear = configuredYears[0]
  return effectiveYear ? value[String(effectiveYear)] : 0
}

const inputMarkup = (type, category, year, targets) => {
  const fieldId = targetYearFieldName(type, category.id, year)
  const explicit = explicitValue(targets, type, category.id, year)
  const value = explicit ?? resolvedValue(targets, type, category.id, year)
  const status =
    explicit === undefined
      ? '<p class="govuk-hint govuk-!-font-size-16">Carried forward</p>'
      : ''
  return `<div class="govuk-form-group govuk-!-margin-bottom-3">
    <label class="govuk-label govuk-visually-hidden" for="${escapeHtml(fieldId)}">${escapeHtml(category.shortLabel)} ${escapeHtml(type)} target for ${escapeHtml(year)}</label>
    <div class="govuk-input__wrapper">
      <input class="govuk-input govuk-input--width-3" id="${escapeHtml(fieldId)}" name="${escapeHtml(fieldId)}" value="${escapeHtml(value)}" inputmode="numeric" spellcheck="false" data-testid="regulator-targets-${type}-${escapeHtml(category.id)}-${escapeHtml(year)}">
      <div class="govuk-input__suffix" aria-hidden="true">%</div>
    </div>
    ${status}
  </div>`
}

const gridMarkup = (type, categories, years, targets) =>
  `<div class="app-target-grid govuk-!-margin-bottom-6" data-testid="regulator-targets-${escapeHtml(type)}-grid">
    <div class="app-target-grid__row app-target-grid__row--head">
      <div class="app-target-grid__category"><p class="govuk-body govuk-!-font-weight-bold">Battery category</p></div>
      ${years.map((year) => `<div class="app-target-grid__year"><p class="govuk-body govuk-!-font-weight-bold">${escapeHtml(year)}</p></div>`).join('')}
    </div>
    ${categories
      .map(
        (category) => `<div class="app-target-grid__row">
          <div class="app-target-grid__category govuk-!-padding-top-2"><p class="govuk-body govuk-!-font-weight-bold">${escapeHtml(category.shortLabel)}</p></div>
          ${years
            .map(
              (year) =>
                `<div class="app-target-grid__cell">${inputMarkup(type, category, year, targets)}</div>`
            )
            .join('')}
        </div>`
      )
      .join('')}
  </div>`

const renderFields = (doc, categories, years, targets) => {
  for (const type of TYPES) {
    doc.querySelector(
      `[data-testid="regulator-targets-${type}-fields"]`
    ).innerHTML = gridMarkup(type, categories, years, targets)
  }
}

const collectValues = (values) => {
  const collectCategory = (categoryValues) =>
    isYearMap(categoryValues)
      ? Object.fromEntries(
          Object.entries(categoryValues).map(([year, value]) => [
            year,
            clampPercent(value)
          ])
        )
      : clampPercent(categoryValues)
  const build = (type) =>
    Object.fromEntries(
      Object.keys(values[type]).map((category) => [
        category,
        collectCategory(values[type][category])
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
  const years =
    payload.targetYears ??
    Array.from({ length: 5 }, (_, index) =>
      String(new Date().getUTCFullYear() + index)
    )
  const targets = storage.getRegulatorTargets(agency.code)
  renderFields(doc, categories, years, targets)

  const form = doc.querySelector('[data-testid="regulator-targets-form"]')
  const hidden = doc.createElement('input')
  hidden.type = 'hidden'
  hidden.name = 'categoryIds'
  hidden.value = categories.map((category) => category.id).join(',')
  form.appendChild(hidden)
  const hiddenYears = doc.createElement('input')
  hiddenYears.type = 'hidden'
  hiddenYears.name = 'targetYears'
  hiddenYears.value = years.join(',')
  form.appendChild(hiddenYears)

  renderAuditEntries(
    doc.querySelector('[data-testid="regulator-targets-history"]'),
    storage
      .listConfigAuditEntries(agency.code, { configType: 'target' })
      .slice(0, HISTORY_PREVIEW_LIMIT),
    payload.auditCopy
  )
  return 'hydrated'
}
