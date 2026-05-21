import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#leaveScheme/confirmation', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the panel with the BPRN placeholder and the dashboard CTA', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.leaveSchemeConfirmation
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-bprn"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-back-to-dashboard"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
  })
})
