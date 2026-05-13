import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#confirmation', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the chrome with placeholder slots and continue button', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingConfirmation
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="confirmation-bprn"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="confirmation-status"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="confirmation-continue"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
    expect(result).toEqual(expect.stringContaining('"step":"confirmation"'))
  })
})
