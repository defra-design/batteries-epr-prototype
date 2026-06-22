import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingDueDiligence', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the due diligence form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingDueDiligence
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="aboveThreshold"'))
  })

  test('POST above threshold without a policy redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingDueDiligence,
      payload: { aboveThreshold: 'yes' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingDueDiligence,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST below the threshold saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingDueDiligence,
      payload: { aboveThreshold: 'no' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingDeclaration)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingDueDiligence,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('POST above the threshold with a policy saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingDueDiligence,
      payload: {
        aboveThreshold: 'yes',
        policyConfirm: 'on',
        verifiedConfirm: 'on',
        policyReference: 'https://example.org/dd'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingDeclaration)
  })
})
