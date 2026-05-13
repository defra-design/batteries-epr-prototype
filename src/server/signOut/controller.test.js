import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#signOutController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the sign-out page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.signOut
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.signOut({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="sign-out-fallback-link"')
    )
  })
})
