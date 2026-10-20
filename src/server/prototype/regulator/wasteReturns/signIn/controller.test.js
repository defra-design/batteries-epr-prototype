import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorWasteReturnsSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the sign in form posting back to the waste returns journey', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorWasteReturnsSignIn
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Sign in to your GOV.UK One Login')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `action="${paths.prototypeRegulatorWasteReturnsSignIn}"`
      )
    )
  })

  test('signing in redirects to the waste returns home', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegulatorWasteReturnsSignIn,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeRegulatorWasteReturnsHome)
  })
})
