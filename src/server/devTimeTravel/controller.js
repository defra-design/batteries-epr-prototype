import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'

export const devTimeTravelController = {
  handler(request, h) {
    if (config.get('isProduction')) {
      throw boom.notFound()
    }

    const pageContent = content.devTimeTravel(request)

    return h.view('devTimeTravel/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      yearLabel: pageContent.yearLabel,
      yearHint: pageContent.yearHint,
      confirmAction: pageContent.confirmAction,
      defaultYear: new Date().getUTCFullYear()
    })
  }
}
