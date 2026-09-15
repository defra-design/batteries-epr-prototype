import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

const setRowValue = (doc, rowKey, value) => {
  byTestId(doc, `check-answers-value-${rowKey}`).textContent = value || '—'
}

const DETAIL_PAGE_PATH_BY_ORG_TYPE = {
  limitedCompany: paths.prototypeMembersListAddMemberCompaniesHouse,
  llp: paths.prototypeMembersListAddMemberCompaniesHouse,
  partnership: paths.prototypeMembersListAddMemberPartnershipDetails,
  soleTrader: paths.prototypeMembersListAddMemberSoleTraderDetails,
  overseas: paths.prototypeMembersListAddMemberOverseasDetails
}

const batteryTypesSummary = (draft) => {
  const categoryContent =
    prototypeComplianceSchemeContent.membersList.addMember.batteryCategory
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

const legalNoticesAddressSummary = (draft) =>
  [draft.legalNoticesBuilding, draft.legalNoticesPostcode]
    .filter(Boolean)
    .join(', ')

export const renderCheckAnswers = (doc, draft) => {
  const pageContent =
    prototypeComplianceSchemeContent.membersList.addMember.checkAnswers
  const organisationTypeLabels =
    prototypeComplianceSchemeContent.membersList.addMember
      .organisationTypeLabels

  setRowValue(
    doc,
    'organisationType',
    organisationTypeLabels[draft.organisationType]
  )
  setRowValue(doc, 'organisationName', draft.organisationName)
  setRowValue(doc, 'organisationAddress', addressSummary(draft))
  setRowValue(doc, 'legalNoticesAddress', legalNoticesAddressSummary(draft))
  setRowValue(doc, 'appropriatePersonName', draft.appropriatePersonName)
  setRowValue(doc, 'appropriatePersonEmail', draft.appropriatePersonEmail)
  setRowValue(doc, 'batteryTypes', batteryTypesSummary(draft))
  setRowValue(doc, 'tonnage', pageContent.tonnageLabels[draft.tonnageBand])
  setRowValue(doc, 'dateJoined', draft.dateJoinedIso)

  const detailPagePath = DETAIL_PAGE_PATH_BY_ORG_TYPE[draft.organisationType]
  if (detailPagePath) {
    const returnParam = `?return=${encodeURIComponent(paths.prototypeMembersListAddMemberCheckAnswers)}`
    byTestId(doc, 'check-answers-change-organisationName').href =
      `${detailPagePath}${returnParam}`
    byTestId(doc, 'check-answers-change-organisationAddress').href =
      `${detailPagePath}${returnParam}`
  }
}
