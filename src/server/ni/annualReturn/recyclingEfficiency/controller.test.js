import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnRecyclingEfficiency', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the recycling efficiency inputs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnRecycling
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="reLeadAcid"'))
  })

  test('POST with a percentage over 100 redirects back and flashes an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnRecycling,
      payload: { reLeadAcid: '120' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnRecycling,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-annual-return-error-summary')
    )
  })

  test('POST with valid percentages saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnRecycling,
      payload: { reLeadAcid: '80', reLithium: '65', reNickelCadmium: '75' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnDeclaration)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnRecycling,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('80'))
  })
})
