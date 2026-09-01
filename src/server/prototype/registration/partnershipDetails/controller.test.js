import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationPartnershipDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the partnership details form with address lookup', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationPartnershipDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-full-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-partnership-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-find-address"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-manual-link"')
    )
  })

  test('POST saves the details and continues to the appropriate person guidance', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationPartnershipDetails,
      payload: {
        contactFullName: 'Pat Partner',
        organisationName: 'Partner Power',
        tradingName: '',
        addressPostcode: 'LS1 4DP',
        addressLine1: '2 Elm Court',
        addressTown: 'Leeds'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Partner Power"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationAppropriatePersonGuidance}"`
      )
    )
  })

  test('POST without required fields redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationPartnershipDetails,
      payload: { tradingName: 'Solo' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationPartnershipDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
