import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#producerRoute', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the radio options and forced-direct notice container', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingProducerRoute
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="producer-route-small-radio"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="producer-route-direct-radio"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="forced-direct"')
    )
  })

  test('POST smallProducer renders savedFields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingProducerRoute,
      payload: { producerRoute: 'smallProducer' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"producerRoute":"smallProducer"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"registration"'))
  })

  test('POST directRegistrant renders savedFields', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.onboardingProducerRoute,
      payload: { producerRoute: 'directRegistrant' }
    })
    expect(result).toEqual(
      expect.stringContaining('"producerRoute":"directRegistrant"')
    )
  })

  test('POST missing route redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingProducerRoute,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after failed POST renders flash error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingProducerRoute,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingProducerRoute,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })
})
