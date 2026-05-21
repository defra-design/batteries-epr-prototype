import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const removeUrl = (memberId) =>
  paths.complianceSchemeMemberRemove.replace('{memberId}', memberId)

const renderView = (h, request, pageContent, viewModel) =>
  h.view('complianceScheme/members/remove/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    cancelUrl: paths.complianceSchemeMembers,
    ...viewModel
  })

export const removeController = {
  get: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).membersPages.remove
      const memberId = request.params.memberId
      return renderView(h, request, pageContent, {
        action: removeUrl(memberId),
        pagePayload: {
          view: 'remove',
          target: 'hydrate',
          memberId
        }
      })
    }
  },
  post: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).membersPages.remove
      const memberId = request.params.memberId
      return renderView(h, request, pageContent, {
        action: removeUrl(memberId),
        pagePayload: {
          view: 'remove',
          target: 'persist',
          memberId,
          next: paths.complianceSchemeMembers
        }
      })
    }
  }
}
