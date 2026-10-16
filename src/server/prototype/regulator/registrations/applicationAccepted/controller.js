import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  applicationPath,
  fill,
  findApplication,
  formatLongDate,
  outcomeBreadcrumbs,
  requireDecision,
  summaryRows
} from '../applicationShared.js'
import { getApplicationDecision } from '../store.js'

export const applicationAcceptedController = {
  handler(request, h) {
    const { applicationId } = request.params
    const { decision, redirect } = requireDecision(
      applicationId,
      'approve',
      h,
      getApplicationDecision
    )
    if (redirect) {
      return redirect
    }

    const labels = prototypeRegulatorRegistrationsContent.accepted
    const found = findApplication(applicationId)
    const values = {
      schemeName: found.schemeName,
      superUser: found.superUser.name,
      signatory: found.signatory.name,
      approvalNumber: found.approvalNumber
    }
    const actions = [
      {
        key: 'schemeSetUp',
        text: labels.actions.schemeSetUp,
        linkText: labels.actions.schemeRecordLink,
        href: applicationPath(paths.prototypeRegulatorApplicationSchemeRecord, {
          applicationId
        })
      },
      ...['superUser', 'signatory', 'approvalNumber', 'conditions'].map(
        (key) => ({ key, text: fill(labels.actions[key], values) })
      )
    ]

    return h.view(
      'prototype/regulator/registrations/applicationAccepted/view',
      {
        ...basePageModel(
          { title: labels.title, heading: found.schemeName },
          { currentNav: 'registrations' }
        ),
        breadcrumbs: outcomeBreadcrumbs(),
        labels,
        bannerBody: fill(labels.bannerBody, values),
        actions,
        summaryRows: summaryRows([
          [labels.summary.status, labels.summary.statusValue],
          [labels.summary.decisionDate, formatLongDate(decision.decidedOn)],
          [
            labels.summary.superUser,
            `${found.superUser.name} (${found.superUser.email})`
          ],
          [labels.summary.approvalNumber, found.approvalNumber]
        ]),
        conditionsHref: applicationPath(
          paths.prototypeRegulatorApplicationConditions,
          { applicationId }
        )
      }
    )
  }
}
