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
    config.set('isProduction', false)
    await server.stop({ timeout: 0 })
  })

  test('renders the dev-reset page outside of production', async () => {
    config.set('isProduction', false)

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.devReset
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="dev-reset-confirm"')
    )
  })

  test('returns 404 in production builds', async () => {
    config.set('isProduction', true)

    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.devReset
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
