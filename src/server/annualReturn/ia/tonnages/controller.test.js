import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

const url = pathTo(paths.annualReturnIaTonnages, { registrationId: 'reg-1' })

describe('#iaTonnages GET', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the form with both category sections and totals row', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-form"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-section-industrial"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-section-automotive"')
    )
    expect(result).toEqual(expect.stringContaining('data-testid="ia-totals"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-total-placed"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-total-collected"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-total-delivered"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-total-exported"')
    )
    expect(result).toEqual(expect.stringContaining('annualReturnIaTonnages'))
  })
})

describe('#iaTonnages POST', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('on valid payload renders savedFields with 24 lines and totals', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: {
        t_industrial_placed_leadAcid: '1',
        t_industrial_placed_nickelCadmium: '0.5',
        t_industrial_collected_leadAcid: '0.3',
        t_automotive_exported_leadAcid: '2.000'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"submissionType":"industrialAutomotiveAnnual"')
    )
    expect(result).toEqual(
      expect.stringContaining('"useDetailedDataEntry":false')
    )
    expect(result).toEqual(expect.stringContaining('"placedTotal":"1.500"'))
    expect(result).toEqual(expect.stringContaining('"collectedTotal":"0.300"'))
    expect(result).toEqual(expect.stringContaining('"exportedTotal":"2.000"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"nextStep":"/annual-return/reg-1/ia/declaration"'
      )
    )
  })

  test('on invalid tonnage redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { t_industrial_placed_leadAcid: 'not a number' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after a failed POST renders the flashed error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url,
      payload: { t_industrial_placed_leadAcid: 'bad' }
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
