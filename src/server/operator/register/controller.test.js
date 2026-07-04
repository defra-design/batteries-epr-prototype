import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const SCHEME_ID = '22222222-0001-4000-a000-000000000001'

describe('#operatorRegister', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the scheme-selection form with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.operatorRegister
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-register-options"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-register-cancel"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.operatorSignIn}"`)
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('POST with a valid schemeId renders a create payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorRegister,
      payload: { schemeId: SCHEME_ID }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"create"'))
    expect(result).toEqual(expect.stringContaining(`"schemeId":"${SCHEME_ID}"`))
    expect(result).toEqual(
      expect.stringContaining(
        '"nextStep":"/operator/application/operator-details"'
      )
    )
  })

  test('POST with no schemeId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorRegister,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-register-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Select a compliance scheme')
    )
  })

  test('POST with a non-uuid schemeId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorRegister,
      payload: { schemeId: 'nope' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-register-error-summary"')
    )
  })
})
