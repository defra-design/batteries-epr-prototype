import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#niSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the sign-in form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-email-input"')
    )
  })

  test('POST with a valid email redirects to the dashboard', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.niSignIn,
      payload: { email: 'ni@example.com' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.niDashboard)
  })

  test('POST with no payload redirects back to sign-in', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.niSignIn
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.niSignIn)
  })

  test('POST with an invalid email redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niSignIn,
      payload: { email: 'not-an-email' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niSignIn)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niSignIn,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-sign-in-error-summary')
    )
  })
})
