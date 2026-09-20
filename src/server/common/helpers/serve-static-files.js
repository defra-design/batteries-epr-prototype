import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../constants/status-codes.js'

const robotsDisallowAll = 'User-agent: *\nDisallow: /\n'

const googleSiteVerificationFileName = paths.googleSiteVerification.slice(1)
const googleSiteVerification = `google-site-verification: ${googleSiteVerificationFileName}`

export const serveStaticFiles = {
  plugin: {
    name: 'staticFiles',
    register(server) {
      server.route([
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: '/favicon.ico',
          handler(_request, h) {
            return h.response().code(statusCodes.noContent).type('image/x-icon')
          }
        },
        {
          options: { auth: false },
          method: 'GET',
          path: paths.robots,
          handler(_request, h) {
            return h.response(robotsDisallowAll).type('text/plain')
          }
        },
        {
          options: { auth: false },
          method: 'GET',
          path: paths.googleSiteVerification,
          handler(_request, h) {
            return h.response(googleSiteVerification).type('text/html')
          }
        },
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: `${config.get('assetPath')}/{param*}`,
          handler: {
            directory: {
              path: '.',
              redirectToSlash: true
            }
          }
        }
      ])
    }
  }
}
