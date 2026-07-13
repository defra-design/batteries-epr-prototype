import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

export const auditTrailController = {
  handler(request, h) {
    const pageContent = content.regulator(request).auditTrailPage
    return h.view('regulator/auditTrail/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      labels: pageContent,
      dashboardUrl: paths.regulatorDashboard,
      signInUrl: paths.regulatorSignIn,
      pagePayload: { view: 'auditTrail', copy: pageContent }
    })
  }
}
