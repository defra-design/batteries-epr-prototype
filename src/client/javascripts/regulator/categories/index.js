import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { renderAuditEntries } from '../auditTrail/render.js'

const HISTORY_PREVIEW_LIMIT = 3

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

export const slugify = (label) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const moveItem = (list, index, delta) => {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(index, 1)
  copy.splice(target, 0, item)
  return copy
}

export const serialiseCategories = (rows) =>
  rows
    .map((row) => {
      const label = row.label.trim()
      const id = row.id || slugify(label)
      return { id, label, shortLabel: label }
    })
    .filter((row) => row.label !== '')

const rowMarkup = (row, index, total, copy) => `
  <div class="govuk-form-group category-row" data-testid="category-row" data-id="${escapeHtml(row.id)}">
    <label class="govuk-label" for="category-label-${index}">${escapeHtml(copy.nameLabel)}</label>
    <input class="govuk-input govuk-input--width-20" id="category-label-${index}" data-testid="category-label" data-index="${index}" value="${escapeHtml(row.label)}" />
    <div class="govuk-button-group">
      <button type="button" class="govuk-button govuk-button--secondary" data-action="up" data-index="${index}" data-testid="category-up"${index === 0 ? ' disabled' : ''}>${escapeHtml(copy.moveUpAction)}</button>
      <button type="button" class="govuk-button govuk-button--secondary" data-action="down" data-index="${index}" data-testid="category-down"${index === total - 1 ? ' disabled' : ''}>${escapeHtml(copy.moveDownAction)}</button>
      <button type="button" class="govuk-button govuk-button--warning" data-action="remove" data-index="${index}" data-testid="category-remove">${escapeHtml(copy.removeAction)}</button>
    </div>
  </div>`

export const runRegulatorCategories = (
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
    storage.saveRegulatorCategories(
      agency.code,
      payload.categories,
      storage.currentRegulatorUser()
    )
    loc.assign('/regulator/categories?saved=1')
    return 'saved'
  }

  const agencyLabel = doc.querySelector(
    '[data-testid="regulator-categories-agency"]'
  )
  agencyLabel.textContent = agency.name
  agencyLabel.hidden = false

  const container = doc.querySelector('#category-rows')
  const rowCopy = payload.rowCopy
  let working = storage
    .resolveCategories(agency.code)
    .map((category) => ({ id: category.id, label: category.label }))

  const render = () => {
    container.innerHTML = working
      .map((row, index) => rowMarkup(row, index, working.length, rowCopy))
      .join('')
  }
  render()

  container.addEventListener('input', (event) => {
    const index = Number(event.target.dataset.index)
    if (!Number.isInteger(index)) return
    working[index] = { ...working[index], label: event.target.value }
  })

  container.addEventListener('click', (event) => {
    const action = event.target.dataset.action
    if (!action) return
    const index = Number(event.target.dataset.index)
    if (action === 'remove') {
      working = working.filter((_, position) => position !== index)
    } else if (action === 'up') {
      working = moveItem(working, index, -1)
    } else {
      working = moveItem(working, index, 1)
    }
    render()
  })

  doc
    .querySelector('[data-testid="regulator-categories-add"]')
    .addEventListener('click', () => {
      working = [...working, { id: '', label: '' }]
      render()
    })

  const jsonField = doc.querySelector('#categoriesJson')
  doc
    .querySelector('[data-testid="regulator-categories-form"]')
    .addEventListener('submit', () => {
      jsonField.value = JSON.stringify(serialiseCategories(working))
    })

  renderAuditEntries(
    doc.querySelector('[data-testid="regulator-categories-history"]'),
    storage
      .listConfigAuditEntries(agency.code, { configType: 'category' })
      .slice(0, HISTORY_PREVIEW_LIMIT),
    payload.auditCopy
  )
  return 'hydrated'
}
