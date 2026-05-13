import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#serviceOfNotice', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the chrome with same/different radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingServiceOfNotice
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('value="sameAsRegistered"'))
    expect(result).toEqual(expect.stringContaining('value="differentAddress"'))
  })

  test('POST sameAsRegistered renders payload with same-flag', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: { sonChoice: 'sameAsRegistered' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"serviceOfNoticeAddressSameAsRegistered":true')
    )
  })

  test('POST differentAddress with valid fields renders explicit address payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: {
        sonChoice: 'differentAddress',
        sonLine1: '99 Notice Street',
        sonLine2: '',
        sonTown: 'Bristol',
        sonPostcode: 'BS1 1AA'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"serviceOfNoticeAddress"'))
    expect(result).toEqual(expect.stringContaining('99 Notice Street'))
  })

  test('POST differentAddress preserves a non-empty line2', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: {
        sonChoice: 'differentAddress',
        sonLine1: '99 Notice Street',
        sonLine2: 'Suite 4',
        sonTown: 'Bristol',
        sonPostcode: 'BS1 1AA'
      }
    })
    expect(result).toEqual(expect.stringContaining('"line2":"Suite 4"'))
  })

  test('POST differentAddress missing fields redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: {
        sonChoice: 'differentAddress',
        sonLine1: '',
        sonTown: '',
        sonPostcode: ''
      }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST missing choice redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET with ?return=/account preserves the return on the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingServiceOfNotice}?return=%2Faccount`
    })
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.onboardingServiceOfNotice}?return=%2Faccount`
      )
    )
  })

  test('POST with ?return=/account uses /account as nextStep', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingServiceOfNotice}?return=%2Faccount`,
      payload: { sonChoice: 'sameAsRegistered' }
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST validation failure with ?return preserves the redirect target', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingServiceOfNotice}?return=%2Faccount`,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.onboardingServiceOfNotice}?return=%2Faccount`
    )
  })

  test('GET after failed POST renders flash error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingServiceOfNotice,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingServiceOfNotice,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })
})
