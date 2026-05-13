import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const validPayload = {
  firstName: 'Test',
  lastName: 'User',
  position: 'Director',
  phone: '01234567890',
  email: 'test@example.com'
}

describe('#contactDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the chrome', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingContactDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('data-testid="first-name"'))
  })

  test('POST valid renders success with savedFields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingContactDetails,
      payload: validPayload
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"primaryContact"'))
    expect(result).toEqual(expect.stringContaining('"firstName":"Test"'))
    expect(result).toEqual(
      expect.stringContaining('"nextStep":"/onboarding/service-of-notice"')
    )
  })

  test('POST invalid email redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingContactDetails,
      payload: { ...validPayload, email: 'nope' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST invalid phone redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingContactDetails,
      payload: { ...validPayload, phone: 'no' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET with ?return=/account preserves the return on the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingContactDetails}?return=%2Faccount`
    })
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.onboardingContactDetails}?return=%2Faccount`
      )
    )
  })

  test('POST with ?return=/account uses /account as nextStep', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingContactDetails}?return=%2Faccount`,
      payload: validPayload
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST validation failure with ?return preserves the redirect target', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingContactDetails}?return=%2Faccount`,
      payload: { ...validPayload, email: 'nope' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.onboardingContactDetails}?return=%2Faccount`
    )
  })

  test('GET ignores an unsafe return value', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingContactDetails}?return=http%3A%2F%2Fevil.test`
    })
    expect(result).not.toEqual(expect.stringContaining('evil.test'))
  })

  test('GET after a failed POST renders the flashed error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingContactDetails,
      payload: { ...validPayload, email: 'nope' }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    expect(cookie).toBeDefined()

    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingContactDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })
})
