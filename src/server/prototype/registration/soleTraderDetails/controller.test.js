import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationSoleTraderDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the sole trader form without a partnership name field', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationSoleTraderDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-full-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-trading-name"')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="details-partnership-name"')
    )
  })

  test('POST uses the trading name as the organisation name when given', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSoleTraderDetails,
      payload: {
        contactFullName: 'Sam Solo',
        tradingName: 'Solo Cells',
        addressPostcode: 'LS1 4DP'
      }
    })
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Solo Cells"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationAppropriatePersonGuidance}"`
      )
    )
  })

  test('POST falls back to the full name as the organisation name', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSoleTraderDetails,
      payload: {
        contactFullName: 'Sam Solo',
        tradingName: '',
        addressPostcode: 'LS1 4DP'
      }
    })
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Sam Solo"')
    )
  })

  test('POST without required fields redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSoleTraderDetails,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationSoleTraderDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
