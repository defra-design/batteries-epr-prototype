import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationOverseasExit', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the overseas exit page with a change-answer link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationOverseasExit
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('You cannot register as an overseas company')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="overseas-exit-change-answer"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegistrationOrganisationType}"`
      )
    )
  })
})
