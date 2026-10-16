import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  fill,
  findApplication,
  formatLongDate,
  outcomeBreadcrumbs,
  requireDecision,
  summaryRows
} from '../applicationShared.js'
import { getApplicationDecision } from '../store.js'

export const applicationRejectedController = {
  handler(request, h) {
    const { applicationId } = request.params
    const { decision, redirect } = requireDecision(
      applicationId,
      'reject',
      h,
      getApplicationDecision
    )
    if (redirect) {
      return redirect
    }

    const labels = prototypeRegulatorRegistrationsContent.rejected
    const found = findApplication(applicationId)

    return h.view(
      'prototype/regulator/registrations/applicationRejected/view',
      {
        ...basePageModel(
          { title: labels.title, heading: found.schemeName },
          { currentNav: 'registrations' }
        ),
        breadcrumbs: outcomeBreadcrumbs(),
        labels,
        bannerBody: fill(labels.bannerBody, { schemeName: found.schemeName }),
        summaryRows: summaryRows([
          [labels.summary.status, labels.summary.statusValue],
          [labels.summary.decisionDate, formatLongDate(decision.decidedOn)],
          [labels.summary.reason, decision.reason]
        ])
      }
    )
  }
}
