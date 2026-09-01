import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationOneLogin', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the one login interstitial with both actions linking to sign in', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationOneLogin
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Create your GOV.UK One Login or sign in')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="one-login-create"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="one-login-sign-in"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegistrationSignIn}"`)
    )
  })
})
