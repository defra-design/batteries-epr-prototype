import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the home page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.home
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.home({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(expect.stringContaining('data-testid="sign-in-cta"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="public-register-cta"')
    )
  })
})
