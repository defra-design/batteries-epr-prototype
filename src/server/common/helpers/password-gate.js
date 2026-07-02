import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'

const openPaths = [paths.password, paths.health]

export function passwordGate(request, h) {
  if (config.get('isTest')) {
    return h.continue
  }

  const isAsset =
    request.path.startsWith(config.get('assetPath')) ||
    request.path === '/favicon.ico'

  if (isAsset || openPaths.includes(request.path)) {
    return h.continue
  }

  if (request.yar.get('authenticated')) {
    return h.continue
  }

  return h
    .redirect(`${paths.password}?returnURL=${encodeURIComponent(request.path)}`)
    .takeover()
}
