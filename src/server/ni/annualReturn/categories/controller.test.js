import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnCategories', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the category checkboxes with a reporting caption', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCategories
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="isPortable"'))
    expect(result).toEqual(expect.stringContaining('Annual return'))
  })

  test('POST with no category redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnCategories,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCategories,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-annual-return-error-summary')
    )
  })

  test('POST with at least one category saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnCategories,
      payload: { isPortable: 'on' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnPlaced)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnCategories,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
  })
})
