import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { pathTo, paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const URL = pathTo(paths.annualReturnSchemeRepresented, {
  registrationId: 'reg-1'
})

describe('#annualReturn/schemeRepresented', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the scheme-represented information page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: URL
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-represented-heading"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-represented-scheme-name"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.accountScheme}"`)
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
  })

  test('GET passes the registrationId through the page payload', async () => {
    const { result } = await server.inject({ method: 'GET', url: URL })
    expect(result).toEqual(expect.stringContaining('"registrationId":"reg-1"'))
  })

  test('POST returns 405 Method Not Allowed', async () => {
    const { statusCode } = await server.inject({ method: 'POST', url: URL })
    expect(statusCode).toBe(statusCodes.methodNotAllowed ?? 405)
  })
})
