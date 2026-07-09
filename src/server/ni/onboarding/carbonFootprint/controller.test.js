import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingCarbonFootprint', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the carbon footprint form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCarbonFootprint
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-carbon-value"')
    )
  })

  test('POST with missing value or class redirects back and flashes errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingCarbonFootprint,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCarbonFootprint,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with an out-of-range recycled percentage redirects back', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingCarbonFootprint,
      payload: {
        carbonFootprintValue: '12',
        performanceClass: 'B',
        recycledCobalt: '150'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingCarbonFootprint)
  })

  test('POST with valid values saves and continues, hydrating on return', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingCarbonFootprint,
      payload: {
        carbonFootprintValue: '42.5',
        performanceClass: 'B',
        recycledCobalt: '16'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingBatteryPassport)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCarbonFootprint,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('42.5'))
  })
})
