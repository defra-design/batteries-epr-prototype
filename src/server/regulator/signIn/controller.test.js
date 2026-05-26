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

  test('POST with a valid agencyCode renders a setCurrentAgencyCode payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorSignIn,
      payload: { agencyCode: 'EA' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"setCurrentAgencyCode"')
    )
    expect(result).toEqual(
      expect.stringContaining('"agencyCode":"EA"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.regulatorDashboard}"`)
    )
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
