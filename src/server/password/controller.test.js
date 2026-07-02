import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'
import { config } from '../../config/config.js'

describe('#passwordController GET', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the password form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.password
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.password({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="password-input"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="password-submit"')
    )
  })

  test('preserves a safe returnURL in the hidden field', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.password}?returnURL=${encodeURIComponent('/dashboard')}`
    })

    expect(result).toEqual(
      expect.stringContaining('name="returnURL" value="/dashboard"')
    )
  })

  test('falls back to the home path for an unsafe returnURL', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.password}?returnURL=${encodeURIComponent('//evil.com')}`
    })

    expect(result).toEqual(
      expect.stringContaining(`name="returnURL" value="${paths.home}"`)
    )
  })
})

describe('#passwordController POST', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('on the correct password sets the session flag and redirects to the returnURL', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.password,
      payload: { password: config.get('password'), returnURL: '/dashboard' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe('/dashboard')
    expect(headers['set-cookie']).toBeDefined()
  })

  test('sanitises an unsafe returnURL to the home path on success', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.password,
      payload: {
        password: config.get('password'),
        returnURL: 'http://evil.com'
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.home)
  })

  test('on the wrong password redirects back to the password page', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.password,
      payload: { password: 'not-the-password', returnURL: '/dashboard' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.password}?returnURL=${encodeURIComponent('/dashboard')}`
    )
  })

  test('on a missing password redirects back to the password page', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.password,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.password}?returnURL=${encodeURIComponent(paths.home)}`
    )
  })

  test('on a subsequent GET after a wrong password renders the flash error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.password,
      payload: { password: 'wrong', returnURL: '/dashboard' }
    })

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    expect(cookie).toBeDefined()

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.password,
      headers: { cookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="password-error-summary"')
    )
    const pageContent = content.password({})
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
  })
})
