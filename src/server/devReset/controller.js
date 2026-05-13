import boom from '@hapi/boom'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'

export const devResetController = {
  handler(request, h) {
    if (config.get('isProduction')) {
      throw boom.notFound()
    }

    const pageContent = content.devReset(request)

    return h.view('devReset/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      confirmAction: pageContent.confirmAction
    })
  }
}
