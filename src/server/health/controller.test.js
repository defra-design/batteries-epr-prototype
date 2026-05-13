import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#healthController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('returns OK', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.health
    })

    expect(result).toEqual({ status: 'OK' })
    expect(statusCode).toBe(statusCodes.ok)
  })
})
