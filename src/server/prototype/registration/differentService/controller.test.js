import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationDifferentService', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the exit page pointing industrial and automotive producers elsewhere', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationDifferentService
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('You need to register with a different service')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="different-service-beis-link"')
    )
  })
})
