import Boom from '@hapi/boom'

import { paths } from '../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../config/prototype-regulator-registrations-content.js'
import { memberList } from './applicationData.js'
import { applicationBreadcrumbs, applicationPath } from './applicationShared.js'
import {
  getMemberListDecision,
  getSchemeMembers,
  getSchemeWithMemberList
} from './store.js'

export const findSchemeWithList = (schemeId) => {
  const scheme = getSchemeWithMemberList(schemeId)
  if (!scheme) {
    throw Boom.notFound('Scheme not found')
  }
  return scheme
}

export const membersOf = (schemeId) =>
  getSchemeMembers(schemeId).map((member) => ({
    ...member,
    type: member.producerSize.replace(' producer', '')
  }))

export const schemePath = (pathTemplate, schemeId) =>
  applicationPath(pathTemplate, { schemeId })

export const memberListBreadcrumbs = (scheme) =>
  applicationBreadcrumbs(scheme.name)

export const submittedOn = memberList.submittedOn

// Outcome pages only make sense after the matching decision.
export const requireMemberListDecision = (schemeId, outcome, h) => {
  const decision = getMemberListDecision(schemeId)
  if (decision?.outcome !== outcome) {
    return {
      redirect: h.redirect(
        schemePath(paths.prototypeRegulatorSchemeMemberList, schemeId)
      )
    }
  }
  return { decision }
}

export const memberListContent = () => ({
  review: prototypeRegulatorRegistrationsContent.memberListReview,
  accepted: prototypeRegulatorRegistrationsContent.memberListAccepted,
  rejected: prototypeRegulatorRegistrationsContent.memberListRejected
})
