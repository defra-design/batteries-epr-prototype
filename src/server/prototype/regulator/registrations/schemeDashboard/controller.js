import Boom from '@hapi/boom'
import { format, parseISO } from 'date-fns'

import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import { memberList } from '../applicationData.js'
import {
  applicationContent,
  applicationPath,
  fill,
  summaryRows
} from '../applicationShared.js'
import {
  getMemberListDecision,
  getSchemeMembers,
  getSchemeWithMemberList
} from '../store.js'

export const schemeDashboardController = {
  handler(request, h) {
    const { schemeId } = request.params
    const scheme = getSchemeWithMemberList(schemeId)
    if (!scheme) {
      throw Boom.notFound('Scheme not found')
    }

    const labels = prototypeRegulatorRegistrationsContent.schemeDashboard
    const memberCount = getSchemeMembers(schemeId).length
    const decided = getMemberListDecision(schemeId) !== null
    const values = {
      schemeName: scheme.name,
      count: memberCount,
      receivedOn: memberList.submittedOn
    }

    return h.view('prototype/regulator/registrations/schemeDashboard/view', {
      ...basePageModel(
        { title: `${labels.title} — ${scheme.name}`, heading: scheme.name },
        { currentNav: 'complianceSchemes' }
      ),
      breadcrumbs: [
        { text: 'NPWD', href: paths.prototypeRegulatorHome },
        {
          text: applicationContent().breadcrumbSchemes,
          href: '#'
        },
        { text: scheme.name }
      ],
      labels,
      statusTag: labels.statusTag,
      summaryRows: summaryRows([
        [labels.summary.npwdCode, scheme.npwdRef],
        [
          labels.summary.approved,
          format(parseISO(scheme.approvedOn), 'd MMMM yyyy')
        ],
        [
          labels.summary.members,
          fill(labels.membersValue, {
            registered: memberCount,
            awaiting: decided ? 0 : memberCount
          })
        ]
      ]),
      task: decided
        ? null
        : {
            title: labels.memberListTask.title,
            tag: labels.memberListTask.tag,
            description: fill(labels.memberListTask.description, values),
            received: fill(labels.memberListTask.received, values),
            action: labels.memberListTask.action,
            href: applicationPath(paths.prototypeRegulatorSchemeMemberList, {
              schemeId
            })
          },
      links: [
        {
          key: 'applications',
          text: fill(labels.links.applications, { count: 0 })
        },
        { key: 'members', text: fill(labels.links.members, values) },
        {
          key: 'pomReturns',
          text: fill(labels.links.pomReturns, { count: 0 })
        },
        { key: 'history', text: labels.links.history }
      ]
    })
  }
}
