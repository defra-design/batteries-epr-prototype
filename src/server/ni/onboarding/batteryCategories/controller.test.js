import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingBatteryCategories', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the category checkboxes', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryCategories
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="isPortable"'))
  })

  test('POST with no category redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingBatteryCategories,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryCategories,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with at least one category saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingBatteryCategories,
      payload: { isPortable: 'on' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingBrandNames)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingBatteryCategories,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
  })
})
