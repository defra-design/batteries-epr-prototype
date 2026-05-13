const PASSWORD = 'b@tteries'
const REALM = 'Defra Batteries Prototype'
const EXEMPT_PATHS = new Set(['/health'])

export function basicAuth(request, h) {
  if (EXEMPT_PATHS.has(request.path)) {
    return h.continue
  }

  const header = request.headers.authorization

  if (header && header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const separatorIndex = decoded.indexOf(':')
    const password =
      separatorIndex === -1 ? decoded : decoded.slice(separatorIndex + 1)

    if (password === PASSWORD) {
      return h.continue
    }
  }

  return h
    .response('Authentication required')
    .code(401)
    .header('WWW-Authenticate', `Basic realm="${REALM}", charset="UTF-8"`)
    .takeover()
}
