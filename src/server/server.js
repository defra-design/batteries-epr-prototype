import path from 'path'
import hapi from '@hapi/hapi'
import Scooter from '@hapi/scooter'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { router } from './router.js'
import { config } from '../config/config.js'
import { pulse } from './common/helpers/pulse.js'
import { catchAll } from './common/helpers/errors.js'
import { nunjucksConfig } from '../config/nunjucks/nunjucks.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { sessionCache } from './common/helpers/session-cache.js'
import { secureContext } from '@defra/hapi-secure-context'
import { contentSecurityPolicy } from './common/helpers/content-security-policy.js'

export async function createServer(plugins) {
  const pluginList = Object.keys(plugins).map((key) => plugins[key])

  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: new CatboxMemory()
      }
    ],
    state: {
      strictHeader: false
    }
  })

  server.app.cache = server.cache({
    cache: 'session',
    expiresIn: config.get('session.cache.ttl'),
    segment: 'session'
  })

  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    ...pluginList,
    nunjucksConfig,
    Scooter,
    router,
    sessionCache,
    contentSecurityPolicy
  ])

  server.ext('onPreResponse', catchAll)

  return server
}
