import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#batteryTypes', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the three checkboxes', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingBatteryTypes
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="isPortable"'))
    expect(result).toEqual(expect.stringContaining('id="isIndustrial"'))
    expect(result).toEqual(expect.stringContaining('id="isAutomotive"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-categories-caveat"')
    )
  })

  test('POST with at least one true renders savedFields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingBatteryTypes,
      payload: { isPortable: 'on', isIndustrial: 'on', isAutomotive: '' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"isPortable":true'))
    expect(result).toEqual(expect.stringContaining('"isIndustrial":true'))
    expect(result).toEqual(expect.stringContaining('"isAutomotive":false'))
  })

  test('POST with no boxes redirects with error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingBatteryTypes,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET with ?return=/account preserves the return on the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingBatteryTypes}?return=%2Faccount`
    })
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.onboardingBatteryTypes}?return=%2Faccount`
      )
    )
  })

  test('POST with ?return=/account uses /account as nextStep', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingBatteryTypes}?return=%2Faccount`,
      payload: { isPortable: 'on' }
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST validation failure with ?return preserves the redirect target', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingBatteryTypes}?return=%2Faccount`,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.onboardingBatteryTypes}?return=%2Faccount`
    )
  })

  test('GET after failed POST renders flash error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingBatteryTypes,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingBatteryTypes,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })
})
