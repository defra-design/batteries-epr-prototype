import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../shared.js'

export const schemeRepresentedController = {
  get: {
    handler(request, h) {
      const pageContent = content.annualReturnSchemeRepresented(request)
      const { registrationId } = request.params

      return h.view('annualReturn/schemeRepresented/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        labels: pageContent,
        dashboardUrl: paths.dashboard,
        accountSchemeUrl: paths.accountScheme,
        pagePayload: {
          step: 'schemeRepresented',
          target: 'hydrate',
          compliancePeriod: getCompliancePeriod(request),
          registrationId,
          labels: pageContent
        }
      })
    }
  },
  post: {
    handler(_request, h) {
      return h.response('Method Not Allowed').code(405)
    }
  }
}
