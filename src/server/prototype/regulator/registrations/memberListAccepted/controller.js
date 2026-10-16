import { paths } from '../../../../../config/paths.js'
import { basePageModel } from '../shared.js'
import { fill, formatLongDate } from '../applicationShared.js'
import {
  findSchemeWithList,
  memberListBreadcrumbs,
  memberListContent,
  requireMemberListDecision,
  schemePath
} from '../memberListShared.js'

export const memberListAcceptedController = {
  handler(request, h) {
    const { schemeId } = request.params
    const scheme = findSchemeWithList(schemeId)
    const { decision, redirect } = requireMemberListDecision(
      schemeId,
      'accept',
      h
    )
    if (redirect) {
      return redirect
    }

    const labels = memberListContent().accepted
    const { registrations } = decision
    const values = {
      schemeName: scheme.name,
      decidedOn: formatLongDate(decision.decidedOn),
      count: registrations.length,
      first: registrations[0].bprn,
      last: registrations.at(-1).bprn
    }
    const heading = fill(labels.heading, values)

    return h.view('prototype/regulator/registrations/memberListAccepted/view', {
      ...basePageModel(
        { title: labels.title, heading, intro: fill(labels.intro, values) },
        { currentNav: 'complianceSchemes' }
      ),
      breadcrumbs: memberListBreadcrumbs(scheme),
      labels,
      panelBody: fill(labels.panelBody, values),
      actions: labels.actions.map((action) => fill(action, values)),
      registrations,
      returnLink: fill(labels.returnLink, values),
      returnHref: schemePath(paths.prototypeRegulatorScheme, schemeId)
    })
  }
}
