import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore } from '../store.js'

const reviewUrl = ({
  schemeId = 'ironwave-compliance',
  abtoId = 'haz-tech',
  siteId = 'portsmouth'
} = {}) =>
  pathTo(paths.prototypeRegulatorWasteReturnsReview, {
    schemeId,
    abtoId,
    siteId
  })

describe('#prototypeRegulatorWasteReturnsReview', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  beforeEach(() => {
    resetWasteReturnsStore()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('shows the site’s facts, reconciliation, BENs, automated checks and caseworking actions', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: reviewUrl()
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Haz Tech (Portsmouth Site)')
    )
    expect(result).toEqual(expect.stringContaining('ABTO/2026/0891'))
    expect(result).toEqual(expect.stringContaining('IronWave Compliance'))
    expect(result).toEqual(expect.stringContaining('Quarter 3, 2026'))
    expect(result).toEqual(expect.stringContaining('30 Nov 2026'))
    expect(result).toEqual(expect.stringContaining('Environment Agency'))

    expect(result).toEqual(
      expect.stringContaining('Reconciliation against BENs — Q3 2026')
    )
    expect(result).toEqual(expect.stringContaining('45.200 tonnes'))
    expect(result).toEqual(expect.stringContaining('12.000 tonnes'))
    expect(result).toEqual(expect.stringContaining('10.000 tonnes'))
    expect(result).toEqual(expect.stringContaining('Mismatch found'))
    expect(result).toEqual(expect.stringContaining('Unissued stockpile'))
    expect(result).toEqual(
      expect.stringContaining(
        'Haz Tech (Portsmouth Site) has issued 6 BENs totalling 63.350 tonnes for Q3 2026.'
      )
    )

    expect(result).toEqual(
      expect.stringContaining('Whole-ton anomaly detected')
    )
    expect(result).toEqual(expect.stringContaining('Repeated tonnage check'))
    expect(result).toEqual(expect.stringContaining('Invisible stockpile alert'))

    expect(result).toEqual(expect.stringContaining('Accept submission'))
    expect(result).toEqual(expect.stringContaining('Query specific row'))
    expect(result).toEqual(
      expect.stringContaining(
        'Opened for review by EA caseworker (current view)'
      )
    )
    expect(result).toEqual(expect.stringContaining('6 October 2026, 11:56am'))
    // Several sites: back goes to the site picker
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, { schemeId: 'ironwave-compliance', abtoId: 'haz-tech' })}"`
      )
    )
  })

  test('shows a match with no checks when intake and BENs agree', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: reviewUrl({ siteId: 'halton-industrial-park' })
    })

    expect(result).toEqual(expect.stringContaining('Match confirmed'))
    expect(result).not.toEqual(expect.stringContaining('Unissued stockpile'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-return-no-checks"')
    )
  })

  test('shows an accepted return as closed, without caseworking actions', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: reviewUrl({ siteId: 'riverside-works' })
    })

    expect(result).toEqual(
      expect.stringContaining('has been accepted and locked')
    )
    expect(result).not.toEqual(expect.stringContaining('Accept submission'))
    expect(result).toEqual(expect.stringContaining('Accepted by EA caseworker'))
    expect(result).not.toEqual(expect.stringContaining('(current view)'))
  })

  test('shows a queried return as closed and links back to the scheme list for a single-site operator', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: reviewUrl({
        schemeId: 'repic',
        abtoId: 'ecobat-treatment',
        siteId: 'nottingham'
      })
    })

    expect(result).toEqual(
      expect.stringContaining('A query has been sent to the ABTO')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, { schemeId: 'repic' })}"`
      )
    )
  })

  test('shows an operator that has not submitted without figures', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: reviewUrl({
        schemeId: 'repic',
        abtoId: 'recell-processing',
        siteId: 'aberdeen'
      })
    })

    expect(result).toEqual(
      expect.stringContaining('has not submitted a waste return')
    )
    expect(result).not.toEqual(expect.stringContaining('Reconciliation'))
    expect(result).not.toEqual(expect.stringContaining('Activity timeline'))
  })

  test('returns 404 for a site that did not treat this scheme’s batteries, or does not exist', async () => {
    const wrongScheme = await server.inject({
      method: 'GET',
      url: reviewUrl({ schemeId: 'repic' })
    })
    const unknownSite = await server.inject({
      method: 'GET',
      url: reviewUrl({ siteId: 'nope' })
    })
    const unknownAbto = await server.inject({
      method: 'GET',
      url: reviewUrl({ abtoId: 'nope' })
    })
    const unknownScheme = await server.inject({
      method: 'GET',
      url: reviewUrl({ schemeId: 'nope' })
    })

    expect(wrongScheme.statusCode).toBe(statusCodes.notFound)
    expect(unknownSite.statusCode).toBe(statusCodes.notFound)
    expect(unknownAbto.statusCode).toBe(statusCodes.notFound)
    expect(unknownScheme.statusCode).toBe(statusCodes.notFound)
  })
})
