import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the fake one login form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Sign in with GOV.UK One Login')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="one-login-email"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="one-login-password"')
    )
  })

  test('POST passes through to the battery category step', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSignIn,
      payload: { email: 'someone@example.com', password: 'anything' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeRegistrationBatteryCategory)
  })
})
