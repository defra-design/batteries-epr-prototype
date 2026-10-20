import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorRegistrationsSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the existing regulator sign-in posting back to this journey', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorRegistrationsSignIn
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `action="${paths.prototypeRegulatorRegistrationsSignIn}"`
      )
    )
  })

  test('signing in leads to the regulator home', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegulatorRegistrationsSignIn
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeRegulatorHome)
  })
})
