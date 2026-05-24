import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const FIRST_OPERATOR_ID = '33333333-0001-4000-a000-000000000001'

describe('#operatorSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio for each approved operator + cancel link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.operatorSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `data-testid="operator-sign-in-radio-${FIRST_OPERATOR_ID}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-sign-in-cancel"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.home}"`))
  })

  test('POST with a valid operatorId renders a setCurrentOperatorId payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorSignIn,
      payload: { operatorId: FIRST_OPERATOR_ID }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"setCurrentOperatorId"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"operatorId":"${FIRST_OPERATOR_ID}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.operatorDashboard}"`)
    )
  })

  test('POST with no operatorId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorSignIn,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-sign-in-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Select an operator to continue')
    )
  })

  test('POST with a non-uuid operatorId renders the error summary', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.operatorSignIn,
      payload: { operatorId: 'not-a-uuid' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-sign-in-error-summary"')
    )
  })
})
