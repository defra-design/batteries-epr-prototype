import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#accessibilityController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the accessibility statement', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.accessibility
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.accessibility({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.introParagraph))
  })
})
