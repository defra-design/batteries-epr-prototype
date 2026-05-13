import Blankie from 'blankie'

import { config } from '../../../config/config.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()

const contentSecurityPolicy = {
  plugin: Blankie,
  options: (request) => {
    const baseUrl = config.get('appBaseUrl').replace(/\/$/, '')

    const formAction = ['self', baseUrl, `${baseUrl}/`]
      .concat(request?.contentSecurityPolicy?.extraAuthOrigins)
      .filter((s) => s)

    if (request?.contentSecurityPolicy?.extraAuthOrigins) {
      logger.info(
        `Updating content security policy: ${request.url} - ${formAction}`
      )
    }

    const scriptSrc = [
      'self',
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"
    ].concat([`'nonce-${request?.contentSecurityPolicy?.scriptNonce}'`])

    return {
      defaultSrc: ['self'],
      fontSrc: ['self', 'data:'],
      connectSrc: ['self', 'wss', 'data:'],
      mediaSrc: ['self'],
      styleSrc: ['self'],
      scriptSrc,
      imgSrc: ['self', 'data:'],
      frameSrc: ['self', 'data:'],
      objectSrc: ['none'],
      frameAncestors: ['none'],
      formAction,
      manifestSrc: ['self'],
      generateNonces: false
    }
  }
}

export { contentSecurityPolicy }
