import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#confirmation', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the panel + back-to-dashboard link', async () => {
    const url = pathTo(paths.annualReturnSmallConfirmation, {
      registrationId: 'reg-1'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-confirmation-intro"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-back-to-dashboard"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
  })
})
