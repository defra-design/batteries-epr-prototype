import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

const addBrandInput = (doc, fields) => {
  const input = doc.createElement('input')
  input.className = 'govuk-input govuk-!-width-two-thirds govuk-!-margin-top-2'
  input.name = 'brandNames'
  input.setAttribute(
    'aria-label',
    prototypeSubmissionContent.brandAdd.brandLabel
  )
  input.setAttribute('data-testid', 'brand-add-input-extra')
  fields.appendChild(input)
  return input
}

export const wireBrandAdd = (doc, submission) => {
  const fields = byTestId(doc, 'brand-add-fields')
  if (!fields) return false

  const existing = submission.brandNames ?? []
  existing.slice(1).forEach(() => addBrandInput(doc, fields))
  const inputs = fields.querySelectorAll('input[name="brandNames"]')
  existing.forEach((name, index) => {
    inputs[index].value = name
  })

  byTestId(doc, 'brand-add-another').addEventListener('click', (event) => {
    event.preventDefault()
    addBrandInput(doc, fields)
  })

  return true
}

export const renderBrandConfirm = (doc, store) => {
  const list = byTestId(doc, 'brand-confirm-list')
  const names = store.getPrototypeSubmission().brandNames ?? []

  list.innerHTML = ''
  names.forEach((name) => {
    const row = doc.createElement('div')
    row.className = 'govuk-summary-list__row'

    const key = doc.createElement('dt')
    key.className = 'govuk-summary-list__key'
    key.textContent = name

    const actions = doc.createElement('dd')
    actions.className = 'govuk-summary-list__actions'
    const remove = doc.createElement('a')
    remove.className = 'govuk-link'
    remove.href = '#'
    remove.textContent = prototypeSubmissionContent.brandConfirm.removeAction
    remove.setAttribute('data-testid', 'brand-confirm-remove')
    remove.addEventListener('click', (event) => {
      event.preventDefault()
      store.savePrototypeSubmission({
        brandNames: names.filter((existing) => existing !== name)
      })
      renderBrandConfirm(doc, store)
    })
    actions.appendChild(remove)

    row.appendChild(key)
    row.appendChild(actions)
    list.appendChild(row)
  })

  byTestId(doc, 'brand-confirm-check').hidden = names.length === 0
  byTestId(doc, 'brand-confirm-empty').hidden = names.length !== 0
  return names.length
}
