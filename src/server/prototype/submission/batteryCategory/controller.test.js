import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionBatteryCategory', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the reconfirm category checkboxes', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBatteryCategory
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-category-portable"')
    )
    expect(result).toEqual(expect.stringContaining('"step":"batteryCategory"'))
  })

  test('POST saves to the registration draft and continues to the tonnage step', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBatteryCategory,
      payload: { isPortable: 'on' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"registration"'))
    expect(result).toEqual(expect.stringContaining('"isPortable":true'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionTonnage}"`
      )
    )
  })

  test('POST honours a return url', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.prototypeSubmissionBatteryCategory}?return=${encodeURIComponent(paths.prototypeSubmissionCheckRegistration)}`,
      payload: { isPortable: 'on' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionCheckRegistration}"`
      )
    )
  })

  test('POST with nothing selected redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBatteryCategory,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBatteryCategory,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-submission-error-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('"skipHydration":true'))
  })
})
