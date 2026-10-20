import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  applicationBreadcrumbs,
  findApplication,
  summaryRows
} from '../applicationShared.js'
import { getApplicationDecision } from '../store.js'

export const applicationSchemeRecordController = {
  handler(request, h) {
    const labels = prototypeRegulatorRegistrationsContent.schemeRecord
    const found = findApplication(request.params.applicationId)
    const { organisation } = found
    const outcome = getApplicationDecision(found.id)?.outcome
    const statusKey =
      outcome === 'approve'
        ? 'approved'
        : outcome === 'reject'
          ? 'rejected'
          : 'pending'

    return h.view(
      'prototype/regulator/registrations/applicationSchemeRecord/view',
      {
        ...basePageModel(
          {
            title: `${labels.title} — ${found.schemeName}`,
            heading: found.schemeName
          },
          { currentNav: 'registrations' }
        ),
        breadcrumbs: applicationBreadcrumbs(found.schemeName),
        labels,
        status: labels.statuses[statusKey],
        organisationRows: summaryRows([
          [labels.organisationRows.approvalNumber, found.approvalNumber],
          [labels.organisationRows.name, found.schemeName],
          [
            labels.organisationRows.companiesHouseNumber,
            organisation.companiesHouseNumber
          ],
          [labels.organisationRows.email, organisation.email]
        ]),
        officeRows: summaryRows([
          [labels.officeRows.address, organisation.address],
          [labels.officeRows.town, organisation.town],
          [labels.officeRows.postcode, organisation.postcode],
          [labels.officeRows.telephone, organisation.telephone],
          [labels.officeRows.approvedFrom, found.approvedFrom],
          [labels.officeRows.compliancePeriod, found.compliancePeriod]
        ]),
        signatory: `${found.signatory.name}, ${found.signatory.position}`
      }
    )
  }
}
