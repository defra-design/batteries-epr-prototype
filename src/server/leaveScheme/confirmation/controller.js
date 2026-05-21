import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const confirmationController = {
  handler(request, h) {
    const pageContent = content.leaveSchemeConfirmation(request)
    return h.view('leaveScheme/confirmation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      labels: pageContent,
      dashboardUrl: paths.dashboard,
      pagePayload: {
        step: 'leaveSchemeConfirmation',
        target: 'hydrate'
      }
    })
  }
}
