// Shared assertions for the "BCS submission of waste data" screens.
export const expectTaskFlowChrome = (html) => {
  expect(html).toEqual(expect.stringContaining('Batteries: Compliance Scheme'))
  expect(html).not.toEqual(expect.stringContaining('pEPR'))
  expect(html).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  expect(html).not.toEqual(expect.stringContaining('govuk-tabs'))
  expect(html).not.toEqual(expect.stringContaining('Manage account'))
  expect(html).not.toEqual(expect.stringContaining('My profile'))
  expect(html).not.toEqual(expect.stringContaining('Sign out'))
}

export const expectNoFigmaSampleData = (html) => {
  expect(html).not.toEqual(expect.stringContaining('Voltguard'))
  expect(html).not.toEqual(expect.stringContaining('David Kwan'))
  expect(html).not.toEqual(expect.stringContaining('Clem Referrer'))
}

export const backLinkHref = (html) =>
  html
    .match(/<a[^>]*data-testid="back-link"[^>]*>/)?.[0]
    .match(/href="([^"]*)"/)?.[1] ?? null

export const pagePayloadFrom = (html) =>
  JSON.parse(html.match(/id="page-payload"[^>]*>([^<]+)<\/script>/)[1])

export const cookieFrom = (response) =>
  response.headers['set-cookie']?.[0]?.split(';')[0]
