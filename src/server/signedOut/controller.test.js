import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#signedOutController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the signed-out page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signedOut
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('You have been signed out'))
    expect(result).toEqual(expect.stringContaining(`href="${paths.signIn}"`))
  })
})
