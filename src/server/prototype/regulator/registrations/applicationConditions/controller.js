import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  fill,
  findApplication,
  outcomeBreadcrumbs,
  requireDecision,
  summaryRows
} from '../applicationShared.js'
import { getApplicationDecision } from '../store.js'

export const applicationConditionsController = {
  handler(request, h) {
    const { applicationId } = request.params
    const { redirect } = requireDecision(
      applicationId,
      'approve',
      h,
      getApplicationDecision
    )
    if (redirect) {
      return redirect
    }

    const labels = prototypeRegulatorRegistrationsContent.conditions
    const found = findApplication(applicationId)

    return h.view(
      'prototype/regulator/registrations/applicationConditions/view',
      {
        ...basePageModel(
          { title: labels.title, heading: labels.title },
          { currentNav: 'registrations' }
        ),
        breadcrumbs: outcomeBreadcrumbs(),
        labels,
        schemeName: found.schemeName,
        intro: fill(labels.intro, {
          schemeName: found.schemeName,
          approvalNumber: found.approvalNumber
        }),
        summaryRows: summaryRows([
          [labels.summary.approvalNumber, found.approvalNumber],
          [labels.summary.approvedFrom, found.approvedFrom],
          [labels.summary.compliancePeriod, found.compliancePeriod],
          [labels.summary.reviewDate, found.reviewDate]
        ])
      }
    )
  }
}
