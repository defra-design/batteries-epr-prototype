import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationOrganisationType', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders all five organisation type radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationOrganisationType
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const testId of [
      'organisation-type-limited-company',
      'organisation-type-llp',
      'organisation-type-partnership',
      'organisation-type-sole-trader',
      'organisation-type-overseas'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${testId}"`))
    }
  })

  const branchCases = [
    ['limitedCompany', paths.prototypeRegistrationCompaniesHouse],
    ['llp', paths.prototypeRegistrationCompaniesHouse],
    ['partnership', paths.prototypeRegistrationPartnershipDetails],
    ['soleTrader', paths.prototypeRegistrationSoleTraderDetails],
    ['overseas', paths.prototypeRegistrationOverseasDetails]
  ]

  for (const [value, expected] of branchCases) {
    test(`POST ${value} routes to its detail page`, async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: paths.prototypeRegistrationOrganisationType,
        payload: { organisationType: value }
      })
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(`"organisationType":"${value}"`)
      )
      expect(result).toEqual(
        expect.stringContaining(`"nextStep":"${expected}"`)
      )
    })
  }

  test('POST with an invalid value redirects back with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationOrganisationType,
      payload: { organisationType: 'charity' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
