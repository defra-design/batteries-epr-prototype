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

export const memberListRejectedController = {
  handler(request, h) {
    const { schemeId } = request.params
    const scheme = findSchemeWithList(schemeId)
    const { decision, redirect } = requireMemberListDecision(
      schemeId,
      'reject',
      h
    )
    if (redirect) {
      return redirect
    }

    const labels = memberListContent().rejected
    const values = {
      schemeName: scheme.name,
      decidedOn: formatLongDate(decision.decidedOn)
    }

    return h.view('prototype/regulator/registrations/memberListRejected/view', {
      ...basePageModel(
        {
          title: labels.title,
          heading: labels.heading,
          intro: fill(labels.intro, values)
        },
        { currentNav: 'complianceSchemes' }
      ),
      breadcrumbs: memberListBreadcrumbs(scheme),
      labels,
      actions: labels.actions.map((action) => fill(action, values)),
      reason: decision.reason,
      returnLink: fill(labels.returnLink, values),
      returnHref: schemePath(paths.prototypeRegulatorScheme, schemeId)
    })
  }
}
