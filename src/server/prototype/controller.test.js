import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#prototypeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the placeholder page with a link back to the area chooser', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.prototype({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-empty"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-home-link"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.home}"`))
  })
})
