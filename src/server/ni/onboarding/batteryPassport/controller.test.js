import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingBatteryPassport', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the passport, labelling and removability sections', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryPassport
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-qr-placeholder"')
    )
  })

  test('POST without a removability choice redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingBatteryPassport,
      payload: { separateCollection: 'on' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryPassport,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with valid labelling and removability saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingBatteryPassport,
      payload: {
        passportCarrierId: 'NI-BP-001',
        separateCollection: 'on',
        capacity: 'on',
        removability: 'yes'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingDueDiligence)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryPassport,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('NI-BP-001'))
  })

  test('POST without a carrier reference still saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingBatteryPassport,
      payload: { removability: 'na' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingDueDiligence)
  })
})
