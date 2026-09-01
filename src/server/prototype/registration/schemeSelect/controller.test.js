import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationSchemeSelect', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio for each compliance scheme', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationSchemeSelect
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const id of ['batteryback', 'recyclingLives', 'erpUk', 'valpak']) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="scheme-select-${id}"`)
      )
    }
  })

  test('POST saves the scheme and continues to check answers', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeSelect,
      payload: { schemeId: 'batteryback' }
    })
    expect(result).toEqual(expect.stringContaining('"schemeId":"batteryback"'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationCheckAnswers}"`
      )
    )
  })

  test('POST without a scheme redirects back', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeSelect,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
