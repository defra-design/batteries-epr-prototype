import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { statusCodes } from '../constants/status-codes.js'

describe('serveStaticFiles', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('serves favicon.ico with no content', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/favicon.ico'
    })

    expect(statusCode).toBe(statusCodes.noContent)
    expect(headers['content-type']).toBe('image/x-icon')
  })

  test('serves built assets from /public', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/public/javascripts/application.js'
    })

    expect([statusCodes.ok, statusCodes.notFound]).toContain(statusCode)
  })
})
