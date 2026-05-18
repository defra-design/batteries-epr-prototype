import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { config } from '../../config/config.js'

describe('#devResetController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each([false, true])(
    'renders the dev-reset page when isProduction=%s',
    async (isProduction) => {
      config.set('isProduction', isProduction)

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: paths.devReset
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('data-testid="dev-reset-confirm"')
      )
    }
  )
})
