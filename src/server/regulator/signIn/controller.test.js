import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#regulatorSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio for each agency + cancel link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-radio-EA"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-radio-NRW"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-radio-SEPA"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-radio-NIEA"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-cancel"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.home}"`))
  })

  test('GET renders a name select for each agency', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorSignIn
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-user-EA"')
    )
    expect(result).toEqual(expect.stringContaining('Priya Shah'))
  })

  test('POST with a valid agencyCode renders a setCurrentAgencyCode payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: { agencyCode: 'EA', regulatorUserEA: 'Daniel Okafor' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"setCurrentAgencyCode"')
    )
    expect(result).toEqual(expect.stringContaining('"agencyCode":"EA"'))
    expect(result).toEqual(
      expect.stringContaining('"regulatorUser":"Daniel Okafor"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.regulatorDashboard}"`)
    )
  })

  test('POST falls back to the first demo user when the name is missing or invalid', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: { agencyCode: 'EA', regulatorUserEA: 'Not A Real User' }
    })
    expect(result).toEqual(
      expect.stringContaining('"regulatorUser":"Priya Shah"')
    )
  })

  test('failAction keeps the chosen name selected', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: { regulatorUserEA: 'Priya Shah' }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('selected'))
  })

  test('POST with no agencyCode renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Select an environment agency to continue')
    )
  })

  test('POST with an invalid agencyCode renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: { agencyCode: 'INVALID' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-sign-in-error-summary"')
    )
  })
})
