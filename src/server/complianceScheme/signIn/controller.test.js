import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const FIRST_SCHEME_ID = '22222222-0001-4000-a000-000000000001'

describe('#complianceSchemeSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio for each approved scheme + cancel link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `data-testid="compliance-scheme-sign-in-radio-${FIRST_SCHEME_ID}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-sign-in-cancel"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.home}"`))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-sign-in-register"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.complianceSchemeRegister}"`)
    )
  })

  test('POST with a valid schemeId renders a setCurrentSchemeId payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeSignIn,
      payload: { schemeId: FIRST_SCHEME_ID }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"setCurrentSchemeId"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"schemeId":"${FIRST_SCHEME_ID}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.complianceSchemeDashboard}"`)
    )
  })

  test('POST with no schemeId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeSignIn,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-sign-in-error-summary"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Select a compliance scheme')
    )
  })

  test('POST with a non-uuid schemeId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeSignIn,
      payload: { schemeId: 'not-a-uuid' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-sign-in-error-summary"'
      )
    )
  })
})
