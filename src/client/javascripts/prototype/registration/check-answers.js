import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

const setRowValue = (doc, rowKey, value) => {
  const el = byTestId(doc, `check-answers-value-${rowKey}`)
  el.textContent = value || '—'
}

export const batteryTypesSummary = (draft) => {
  const categoryContent = prototypeRegistrationContent.batteryCategory
  return [
    draft.isPortable && categoryContent.portableLabel,
    draft.isIndustrial && categoryContent.industrialLabel,
    draft.isAutomotive && categoryContent.automotiveLabel
  ]
    .filter(Boolean)
    .join(', ')
}

const addressSummary = (draft) =>
  [
    draft.overseasAddress,
    draft.addressLine1,
    draft.addressTown,
    draft.addressPostcode
  ]
    .filter(Boolean)
    .join(', ')

export const renderCheckAnswers = (doc, draft) => {
  const pageContent = prototypeRegistrationContent.checkAnswers

  setRowValue(doc, 'batteryTypes', batteryTypesSummary(draft))
  setRowValue(doc, 'tonnage', pageContent.tonnageLabels[draft.tonnageBand])
  setRowValue(
    doc,
    'organisationType',
    prototypeRegistrationContent.organisationTypeLabels[draft.organisationType]
  )
  setRowValue(doc, 'organisationName', draft.organisationName)
  setRowValue(doc, 'organisationAddress', addressSummary(draft))
  setRowValue(doc, 'appropriatePersonName', draft.appropriatePersonName)
  setRowValue(doc, 'appropriatePersonEmail', draft.appropriatePersonEmail)
  setRowValue(doc, 'appropriatePersonRole', draft.appropriatePersonRole)
  setRowValue(
    doc,
    'schemeMembership',
    prototypeRegistrationContent.schemeMembershipLabels[draft.schemeMembership]
  )

  const schemeRow = byTestId(doc, 'check-answers-row-scheme')
  if (draft.schemeMembership === 'yes') {
    const scheme = prototypeRegistrationContent.schemes.find(
      (s) => s.id === draft.schemeId
    )
    setRowValue(doc, 'scheme', scheme?.name)
    schemeRow.hidden = false
    schemeRow.style.display = ''
  } else {
    schemeRow.hidden = true
    schemeRow.style.display = 'none'
  }
}
