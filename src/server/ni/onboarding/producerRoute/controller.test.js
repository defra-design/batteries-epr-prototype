import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingProducerRoute', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the producer route radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingProducerRoute
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-route-self"')
    )
  })

  test('POST with no choice redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingProducerRoute,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingProducerRoute,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with a route saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingProducerRoute,
      payload: { producerRoute: 'self' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingCarbonFootprint)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingProducerRoute,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
  })
})
