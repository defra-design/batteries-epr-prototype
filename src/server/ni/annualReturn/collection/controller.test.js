import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnCollection', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the collection tonnage inputs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCollection
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="colPortable"'))
  })

  test('POST with a negative tonnage redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnCollection,
      payload: { colPortable: '-3' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCollection,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-annual-return-error-summary')
    )
  })

  test('POST with valid tonnages saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnCollection,
      payload: { colPortable: '70', colIndustrial: '30', colAutomotive: '0' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnRecycling)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCollection,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('70'))
  })
})
