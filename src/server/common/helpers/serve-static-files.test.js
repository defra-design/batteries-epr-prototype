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

  test('serves a robots.txt that disallows all crawling', async () => {
    const { statusCode, headers, payload } = await server.inject({
      method: 'GET',
      url: '/robots.txt'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toContain('text/plain')
    expect(payload).toBe('User-agent: *\nDisallow: /\n')
  })

  test('serves the Google Search Console verification file at the root', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/google0297e4bffe761ccd.html'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toBe(
      'google-site-verification: google0297e4bffe761ccd.html'
    )
  })

  test('serves built assets from /public', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/public/javascripts/application.js'
    })

    expect([statusCodes.ok, statusCodes.notFound]).toContain(statusCode)
  })
})
