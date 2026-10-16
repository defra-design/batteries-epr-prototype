import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const sitesUrl = (abtoId, schemeId = 'ironwave-compliance') =>
  pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, { schemeId, abtoId })

const reviewUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsReview, {
    schemeId: 'ironwave-compliance',
    abtoId: 'haz-tech',
    siteId
  })

describe('#prototypeRegulatorWasteReturnsAbtoSites', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('lists the operator’s sites for the scheme as radios with their approval numbers', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: sitesUrl('haz-tech')
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Which site’s waste return do you want to review?'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Haz Tech has 3 approved sites')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Haz Tech, Unit 4, Halton Industrial Park – ABTO/2026/0412'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Haz Tech, Portsmouth Site – ABTO/2026/0891')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="abto-sites-site-riverside-works"')
    )
  })

  test('goes straight to the return when the operator has only one site', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'GET',
      url: sitesUrl('halton-battery-processing')
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      pathTo(paths.prototypeRegulatorWasteReturnsReview, {
        schemeId: 'ironwave-compliance',
        abtoId: 'halton-battery-processing',
        siteId: 'foundry-lane'
      })
    )
  })

  test('selecting a site continues to that site’s waste return', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: sitesUrl('haz-tech'),
      payload: { site: 'portsmouth' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(reviewUrl('portsmouth'))
  })

  test('shows an error when no site is selected', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: sitesUrl('haz-tech'),
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="abto-sites-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('Select a site'))
  })

  test('rejects a site that did not treat this scheme’s batteries', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: sitesUrl('haz-tech'),
      payload: { site: 'cardiff' }
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })

  test('returns 404 for an unknown operator or one that served another scheme', async () => {
    const unknown = await server.inject({
      method: 'GET',
      url: sitesUrl('nope')
    })
    const otherScheme = await server.inject({
      method: 'GET',
      url: sitesUrl('haz-tech', 'repic')
    })
    const unknownScheme = await server.inject({
      method: 'GET',
      url: sitesUrl('haz-tech', 'nope')
    })

    expect(unknown.statusCode).toBe(statusCodes.notFound)
    expect(otherScheme.statusCode).toBe(statusCodes.notFound)
    expect(unknownScheme.statusCode).toBe(statusCodes.notFound)
  })
})
