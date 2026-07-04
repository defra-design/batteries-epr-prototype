import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#complianceSchemeRegister', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio for each regulator + cancel link to sign in', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeRegister
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const code of ['EA', 'NRW', 'SEPA', 'NIEA']) {
      expect(result).toEqual(
        expect.stringContaining(
          `data-testid="compliance-scheme-register-radio-${code}"`
        )
      )
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-register-cancel"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.complianceSchemeSignIn}"`)
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('POST with a valid agencyCode renders a create payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeRegister,
      payload: { agencyCode: 'NRW' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"create"'))
    expect(result).toEqual(expect.stringContaining('"agencyCode":"NRW"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"nextStep":"/compliance-scheme/application/scheme-details"'
      )
    )
  })

  test('POST with no agencyCode renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeRegister,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-register-error-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Select a regulator'))
  })

  test('POST with an invalid agencyCode renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeRegister,
      payload: { agencyCode: 'XXX' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-register-error-summary"'
      )
    )
  })
})
