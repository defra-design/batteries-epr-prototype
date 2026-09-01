import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationBatteryCategory', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the category checkboxes and sidebar', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationBatteryCategory
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-category-portable"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-category-automotive"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-category-sidebar"')
    )
    expect(result).toEqual(expect.stringContaining('"step":"batteryCategory"'))
  })

  test('POST with portable selected continues to the tonnage step', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationBatteryCategory,
      payload: { isPortable: 'on', isIndustrial: 'on' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"isPortable":true'))
    expect(result).toEqual(expect.stringContaining('"isIndustrial":true'))
    expect(result).toEqual(expect.stringContaining('"isAutomotive":false'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationTonnage}"`
      )
    )
  })

  test('POST without portable routes to the different service exit', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationBatteryCategory,
      payload: { isIndustrial: 'on', isAutomotive: 'on' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationDifferentService}"`
      )
    )
  })

  test('POST honours a return url when portable is selected', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.prototypeRegistrationBatteryCategory}?return=${encodeURIComponent(paths.prototypeRegistrationCheckAnswers)}`,
      payload: { isPortable: 'on' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationCheckAnswers}"`
      )
    )
  })

  test('POST with nothing selected redirects back with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationBatteryCategory,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after failed POST renders the flashed error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationBatteryCategory,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationBatteryCategory,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('"skipHydration":true'))
  })
})
