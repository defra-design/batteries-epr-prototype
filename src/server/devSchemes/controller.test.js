import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#devSchemes', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET returns the seed scheme dump as JSON', async () => {
    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.devSchemes
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('application/json')
    )
    expect(result.seedVersion).toBeGreaterThan(0)
    expect(Array.isArray(result.schemes)).toBe(true)
    expect(result.schemes.length).toBeGreaterThanOrEqual(4)
  })
})
