import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const radioId = (index) => (index === 0 ? 'schemeId' : `schemeId-${index + 1}`)

const hintMarkup = (scheme, id) =>
  scheme.operator
    ? `<div id="${id}-item-hint" class="govuk-hint govuk-radios__hint">${escape(scheme.operator)}</div>`
    : ''

const optionMarkup = (scheme, index) => {
  const id = radioId(index)
  return `<div class="govuk-radios__item">
      <input class="govuk-radios__input" id="${id}" name="schemeId" type="radio" value="${escape(scheme.id)}" data-testid="compliance-scheme-sign-in-radio-${escape(scheme.id)}">
      <label class="govuk-label govuk-radios__label" for="${id}">${escape(scheme.name)}</label>
      ${hintMarkup(scheme, id)}
    </div>`
}

const renderOptions = (doc, schemes) => {
  const container = doc.querySelector(
    '[data-testid="compliance-scheme-sign-in-options"]'
  )
  container.innerHTML = schemes.map(optionMarkup).join('')
}

export const runSchemeSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'setCurrentSchemeId') {
    storage.seedDemoData()
    renderOptions(doc, storage.getSchemes({ status: 'approved' }))
    return 'hydrated'
  }

  storage.setCurrentSchemeId(payload.schemeId)
  loc.assign(payload.nextStep)
  return 'navigated'
}
