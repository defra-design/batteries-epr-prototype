import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#signInController GET', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the sign-in form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signIn
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.signIn({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining('data-testid="email-input"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="sign-in-submit"')
    )
  })
})

describe('#signInController POST', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('on valid email renders the success interstitial with page-payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.signIn,
      payload: { email: 'a@b.com' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="sign-in-success-message"')
    )
    expect(result).toEqual(expect.stringContaining('"email":"a@b.com"'))
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
  })

  test('lowercases and trims the submitted email before placing it in the payload', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.signIn,
      payload: { email: '  Test@Example.COM  ' }
    })

    expect(result).toEqual(
      expect.stringContaining('"email":"test@example.com"')
    )
  })

  test('on invalid email redirects back to /sign-in', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.signIn,
      payload: { email: 'not-an-email' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.signIn)
  })

  test('on missing email redirects back to /sign-in', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.signIn,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.signIn)
  })

  test('on subsequent GET after a failed POST renders the flash error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.signIn,
      payload: { email: 'bad-email' }
    })

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    expect(cookie).toBeDefined()

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signIn,
      headers: { cookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="sign-in-error-summary"')
    )
    const pageContent = content.signIn({})
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
    expect(result).toEqual(expect.stringContaining('value="bad-email"'))
  })
})
