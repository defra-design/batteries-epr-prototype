import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationCompaniesHouse', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the search form with hidden address fields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationCompaniesHouse
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-number"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-search"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-address-line1"')
    )
  })

  test('POST with a valid company saves the details and continues to guidance', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationCompaniesHouse,
      payload: {
        organisationName: 'Demo Power Cells Ltd',
        companyNumber: '12345678',
        addressLine1: '1 Demo Way',
        addressTown: 'Manchester',
        addressPostcode: 'M1 4AA'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Demo Power Cells Ltd"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationAppropriatePersonGuidance}"`
      )
    )
  })

  test('POST with a bad company number redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationCompaniesHouse,
      payload: { organisationName: 'Demo', companyNumber: '123' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationCompaniesHouse,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
