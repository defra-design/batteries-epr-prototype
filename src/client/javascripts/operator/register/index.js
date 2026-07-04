import { storage, createOperator } from '../../storage-adapter.js'
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

const agencyName = (code) =>
  storage.getAgencies().find((agency) => agency.code === code).name

const optionMarkup = (scheme, index) => {
  const id = radioId(index)
  return `<div class="govuk-radios__item">
      <input class="govuk-radios__input" id="${id}" name="schemeId" type="radio" value="${escape(scheme.id)}" data-testid="operator-register-radio-${escape(scheme.id)}">
      <label class="govuk-label govuk-radios__label" for="${id}">${escape(scheme.name)}</label>
      <div id="${id}-item-hint" class="govuk-hint govuk-radios__hint">${escape(agencyName(scheme.agencyCode))}</div>
    </div>`
}

const renderOptions = (doc, schemes) => {
  doc.querySelector('[data-testid="operator-register-options"]').innerHTML =
    schemes.map(optionMarkup).join('')
}

export const runOperatorRegister = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'create') {
    storage.seedDemoData()
    renderOptions(doc, storage.getSchemes({ status: 'approved' }))
    return 'hydrated'
  }

  const scheme = storage.getScheme(payload.schemeId)
  const operator = storage.saveOperator(
    createOperator({
      schemeId: scheme.id,
      agencyCode: scheme.agencyCode,
      schemeApprovalStatus: 'pending',
      approvalStatus: 'in-progress'
    })
  )
  storage.setCurrentOperatorId(operator.id)
  loc.assign(payload.nextStep)
  return 'created'
}
