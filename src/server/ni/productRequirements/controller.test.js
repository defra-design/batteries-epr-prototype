import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#niProductRequirements', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the product-requirements container', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niProductRequirements
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-product-requirements"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-ni-requirements-results')
    )
  })
})
