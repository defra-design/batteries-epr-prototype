import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#aboutController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the about page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.about
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.about({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading.text))
    expect(result).toEqual(expect.stringContaining(pageContent.body))
  })
})
