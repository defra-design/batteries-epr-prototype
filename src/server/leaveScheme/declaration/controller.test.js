import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#leaveScheme/declaration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the declaration form and back link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.leaveSchemeDeclaration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-declaration-confirm"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.leaveSchemeReason}"`)
    )
  })

  test('POST with confirmation flips target to transition with confirmation nextStep', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeDeclaration,
      payload: { declarationConfirm: 'yes' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"transition"'))
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.leaveSchemeConfirmation}"`)
    )
  })

  test('POST without confirmation re-renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeDeclaration,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('You must confirm the declaration')
    )
  })
})
