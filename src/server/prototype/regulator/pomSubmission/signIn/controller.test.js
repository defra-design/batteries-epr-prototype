import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the fake One Login sign in form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Sign in to your GOV.UK One Login')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-email"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-password"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-forgot-email"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-forgot-password"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-create"')
    )
  })

  test('does not render a service name or navigation in the header', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionSignIn
    })

    expect(result).not.toEqual(expect.stringContaining('Batteries: Regulator'))
    expect(result).not.toEqual(
      expect.stringContaining('govuk-service-navigation__service-name')
    )
  })

  test('POST passes through to the regulator dashboard', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegulatorPomSubmissionSignIn,
      payload: { email: 'someone@example.com', password: 'anything' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      paths.prototypeRegulatorPomSubmissionDashboard
    )
  })
})
