import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationTonnage', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders both tonnage band radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationTonnage
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="tonnage-up-to-1-tonne"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="tonnage-over-1-tonne"')
    )
    expect(result).toEqual(expect.stringContaining('"step":"tonnage"'))
  })

  test('POST saves the band and continues to organisation type', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationTonnage,
      payload: { tonnageBand: 'upTo1Tonne' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"tonnageBand":"upTo1Tonne"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationOrganisationType}"`
      )
    )
  })

  test('POST over 1 tonne also continues (open question: no exit in the design)', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationTonnage,
      payload: { tonnageBand: 'over1Tonne' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationOrganisationType}"`
      )
    )
  })

  test('POST honours a return url back to check answers', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.prototypeRegistrationTonnage}?return=${encodeURIComponent(paths.prototypeRegistrationCheckAnswers)}`,
      payload: { tonnageBand: 'upTo1Tonne' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationCheckAnswers}"`
      )
    )
  })

  test('POST without a band redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationTonnage,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationTonnage,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
