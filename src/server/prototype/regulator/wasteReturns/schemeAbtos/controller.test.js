import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const urlFor = (schemeId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, { schemeId })

describe('#prototypeRegulatorWasteReturnsSchemeAbtos', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('lists the operators that treated the scheme’s batteries, with overall status', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor('ironwave-compliance')
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'treated batteries handed over by IronWave Compliance'
      )
    )
    // Multi-site operator: aggregated, awaiting review wins over accepted
    expect(result).toEqual(expect.stringContaining('3 approved sites'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--yellow"[^>]*>\s*Awaiting review/)
    )
    expect(result).toEqual(expect.stringContaining('7 Oct 2026'))
    // Single-site operator shows its approval number and site in the name
    expect(result).toEqual(
      expect.stringContaining('Halton Battery Processing Ltd (Foundry Lane)')
    )
    expect(result).toEqual(expect.stringContaining('ABTO/2025/0412'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Accepted/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, { schemeId: 'ironwave-compliance', abtoId: 'haz-tech' })}"`
      )
    )
  })

  test('shows query sent, overdue and not submitted for the REPIC operators', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor('repic')
    })

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue"[^>]*>\s*Query sent/)
    )
    expect(result).toEqual(expect.stringContaining('Overdue'))
    expect(result).toEqual(expect.stringContaining('Not submitted'))
    expect(result).toEqual(expect.stringContaining('ABS'))
  })

  test('returns 404 for an unknown scheme and for a scheme with no waste returns', async () => {
    const unknown = await server.inject({
      method: 'GET',
      url: urlFor('nope')
    })
    const empty = await server.inject({
      method: 'GET',
      url: urlFor('voltguard-batteries')
    })

    expect(unknown.statusCode).toBe(statusCodes.notFound)
    expect(empty.statusCode).toBe(statusCodes.notFound)
  })
})
