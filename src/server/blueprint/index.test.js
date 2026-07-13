import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'

describe('#blueprint', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('serves the standalone blueprint page as HTML', async () => {
    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/blueprint'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('text/html')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Battery EPR — future-state blueprints, all actors'
      )
    )
  })

  test('does not apply the app content security policy to the page', async () => {
    const { headers } = await server.inject({
      method: 'GET',
      url: '/blueprint'
    })

    expect(headers['content-security-policy']).toBeUndefined()
  })
})
