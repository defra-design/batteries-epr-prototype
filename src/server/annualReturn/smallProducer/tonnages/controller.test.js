import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

const url = pathTo(paths.annualReturnSmallTonnages, { registrationId: 'reg-1' })

describe('#tonnages GET', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the form with mode radios and both tables', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-form"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="simple-fields"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="detailed-fields"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="grand-total-value"')
    )
    expect(result).toEqual(
      expect.stringContaining('"step":"smallProducerTonnages"')
    )
    expect(result).toEqual(expect.stringContaining('"registrationId":"reg-1"'))
  })

  test('emits the small-producer tonnages bundle script tag', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    expect(result).toEqual(expect.stringContaining('annualReturnSmallTonnages'))
  })
})

describe('#tonnages POST', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('on simple mode renders savedFields with 3 chemistry lines', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: {
        mode: 'simple',
        t_leadAcid: '0.123',
        t_nickelCadmium: '0.4',
        t_other: ''
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"useDetailedDataEntry":false')
    )
    expect(result).toEqual(expect.stringContaining('"chemistry":"leadAcid"'))
    expect(result).toEqual(expect.stringContaining('"tonnes":"0.123"'))
    expect(result).toEqual(expect.stringContaining('"tonnes":"0.400"'))
    expect(result).toEqual(expect.stringContaining('"tonnes":"0.000"'))
    expect(result).toEqual(expect.stringContaining('"placedTotal":"0.523"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"nextStep":"/annual-return/reg-1/small-producer/declaration"'
      )
    )
  })

  test('on detailed mode renders savedFields with 15 lines', async () => {
    const payload = { mode: 'detailed' }
    payload.t_leadAcid_buttonCells = '0.1'
    const { result } = await server.inject({ method: 'POST', url, payload })
    expect(result).toEqual(
      expect.stringContaining('"useDetailedDataEntry":true')
    )
    expect(result).toEqual(
      expect.stringContaining('"subCategory":"buttonCells"')
    )
    expect(result).toEqual(expect.stringContaining('"placedTotal":"0.100"'))
  })

  test('on missing mode redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('on invalid simple-mode tonnage redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { mode: 'simple', t_leadAcid: 'not a number' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('on invalid detailed-mode tonnage redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { mode: 'detailed', t_leadAcid_buttonCells: 'not a number' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after a failed POST renders the flashed error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url,
      payload: { mode: 'simple', t_leadAcid: 'bad' }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    expect(cookie).toBeDefined()

    const { result } = await server.inject({
      method: 'GET',
      url,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-error-summary"')
    )
  })
})
