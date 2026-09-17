const NO_INDEX_DIRECTIVE = 'noindex, nofollow'

export function noIndexHeaders(request, h) {
  const { response } = request
  const isBoom = 'isBoom' in response

  if (isBoom) {
    response.output.headers['X-Robots-Tag'] = NO_INDEX_DIRECTIVE
  } else {
    response.header('X-Robots-Tag', NO_INDEX_DIRECTIVE)
  }

  return h.continue
}
