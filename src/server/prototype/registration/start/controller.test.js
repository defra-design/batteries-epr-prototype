import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationStart', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the start page with a start button to the one login page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationStart
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Register as a battery producer')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="registration-start-button"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegistrationOneLogin}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="registration-related-content"')
    )
    expect(result).toEqual(
      expect.stringContaining('Producer responsibility for waste')
    )
  })
})
