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

const radioId = (index) =>
  index === 0 ? 'operatorId' : `operatorId-${index + 1}`

const typeLabel = (operator) =>
  operator.approvalType === 'abe' ? 'ABE' : 'ABTO'

const optionMarkup = (operator, index) => {
  const id = radioId(index)
  const hint = `${typeLabel(operator)} — ${operator.approvalNumber}`
  return `<div class="govuk-radios__item">
      <input class="govuk-radios__input" id="${id}" name="operatorId" type="radio" value="${escape(operator.id)}" data-testid="operator-sign-in-radio-${escape(operator.id)}">
      <label class="govuk-label govuk-radios__label" for="${id}">${escape(operator.name)}</label>
      <div id="${id}-item-hint" class="govuk-hint govuk-radios__hint">${escape(hint)}</div>
    </div>`
}

const renderOptions = (doc, operators) => {
  doc.querySelector('[data-testid="operator-sign-in-options"]').innerHTML =
    operators.map(optionMarkup).join('')
}

export const runOperatorSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'setCurrentOperatorId') {
    storage.seedDemoData()
    renderOptions(doc, storage.listApprovedOperators())
    return 'hydrated'
  }

  storage.setCurrentOperatorId(payload.operatorId)
  loc.assign(payload.nextStep)
  return 'navigated'
}
