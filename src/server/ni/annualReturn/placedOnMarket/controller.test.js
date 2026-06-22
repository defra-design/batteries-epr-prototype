import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnPlacedOnMarket', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the placed-on-market tonnage inputs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnPlaced
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="pomPortable"'))
  })

  test('POST with all-zero tonnages flashes the at-least-one error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnPlaced,
      payload: { pomPortable: '0', pomIndustrial: '0', pomAutomotive: '0' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnPlaced,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-annual-return-error-summary')
    )
  })

  test('POST with a negative tonnage flashes a number error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnPlaced,
      payload: { pomPortable: '-5' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnPlaced)
  })

  test('POST with valid tonnages saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnPlaced,
      payload: { pomPortable: '120.5', pomIndustrial: '40', pomAutomotive: '0' }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnCollection)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnPlaced,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('120.5'))
  })
})
