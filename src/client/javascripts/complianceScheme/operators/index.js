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

const typeLabel = (operator) =>
  operator.approvalType === 'abe' ? 'ABE' : 'ABTO'

const ensureScheme = (loc) => {
  storage.seedDemoData()
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return null
  }
  return scheme
}

const renderList = (doc, bodyTestId, emptyTestId, rows, rowMarkup) => {
  const body = doc.querySelector(`[data-testid="${bodyTestId}"]`)
  const empty = doc.querySelector(`[data-testid="${emptyTestId}"]`)
  if (rows.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  body.innerHTML = rows.map(rowMarkup).join('')
}

const pendingRow = (operator, copy) =>
  `<tr class="govuk-table__row" data-testid="operators-pending-row" data-operator-id="${escape(operator.id)}">
      <td class="govuk-table__cell" data-testid="operators-pending-name">${escape(operator.name)}</td>
      <td class="govuk-table__cell">${escape(typeLabel(operator))}</td>
      <td class="govuk-table__cell">
        <button type="button" class="govuk-button govuk-button--secondary govuk-!-margin-right-2" data-testid="operators-pending-accept" data-operator-id="${escape(operator.id)}">${escape(copy.acceptAction)}</button>
        <button type="button" class="govuk-button govuk-button--warning" data-testid="operators-pending-reject" data-operator-id="${escape(operator.id)}">${escape(copy.rejectAction)}</button>
      </td>
    </tr>`

const approvedRow = (operator) =>
  `<tr class="govuk-table__row" data-testid="operators-approved-row">
      <td class="govuk-table__cell">${escape(operator.name)}</td>
      <td class="govuk-table__cell">${escape(typeLabel(operator))}</td>
      <td class="govuk-table__cell">${escape(operator.approvalNumber ?? '')}</td>
    </tr>`

const wirePendingActions = (doc, loc, copy) => {
  doc
    .querySelectorAll('[data-testid="operators-pending-accept"]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        if (!globalThis.confirm(copy.acceptConfirm)) return
        storage.approveOperatorForScheme(button.dataset.operatorId)
        loc.reload()
      })
    })
  doc
    .querySelectorAll('[data-testid="operators-pending-reject"]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        if (!globalThis.confirm(copy.rejectConfirm)) return
        storage.rejectOperatorForScheme(button.dataset.operatorId)
        loc.reload()
      })
    })
}

export const runOperatorsPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'

  renderList(
    doc,
    'operators-pending-body',
    'operators-pending-empty',
    storage.listPendingOperatorsForScheme(scheme.id),
    (operator) => pendingRow(operator, payload.copy)
  )
  renderList(
    doc,
    'operators-approved-body',
    'operators-approved-empty',
    storage.listApprovedOperatorsForScheme(scheme.id),
    approvedRow
  )
  wirePendingActions(doc, loc, payload.copy)
  return 'rendered'
}
